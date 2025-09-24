import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { SupplierType } from "@/types/supplier";

const dataFilePath = path.join(process.cwd(), "data", "suppliers.json");

async function readData(): Promise<SupplierType[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    return fileContent ? JSON.parse(fileContent) : [];
  } catch (error) {
    return [];
  }
}

async function writeData(data: SupplierType[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

function matchesActiveFilter(value: string | null, supplier: SupplierType) {
  if (!value || value === "all") return true;
  if (value === "active" || value === "true") return supplier.active;
  if (value === "inactive" || value === "false") return !supplier.active;
  return true;
}

// GET all suppliers with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const allSuppliers = await readData();
    const { searchParams } = req.nextUrl;

    const search = (searchParams.get("q") || "").trim().toLowerCase();
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1);
    const activeFilter = searchParams.get("active");

    const filteredSuppliers = allSuppliers.filter((supplier) => {
      const nameMatch = search ? supplier.name.toLowerCase().includes(search) : true;
      const activeMatch = matchesActiveFilter(activeFilter, supplier);
      return nameMatch && activeMatch;
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    const totalCount = allSuppliers.length;
    const activeCount = allSuppliers.filter((s) => s.active).length;

    return NextResponse.json({
      items: paginatedSuppliers,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(filteredSuppliers.length / pageSize) || 1,
          total: filteredSuppliers.length,
        },
      },
      totalCount,
      activeCount,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal error", details: e.message },
      { status: 500 }
    );
  }
}

// POST a new supplier
export async function POST(req: NextRequest) {
  try {
    const suppliers = await readData();
    const newSupplierData = await req.json();

    if (!newSupplierData.name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const maxId = suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id || 0)) + 1 : 1;

    const newSupplier: SupplierType = {
      ...newSupplierData,
      id: maxId,
      documentId: crypto.randomUUID(),
      active: newSupplierData.active !== undefined ? newSupplierData.active : true,
      ingredientes: newSupplierData.ingredientes || [],
      ingredient_supplier_prices: newSupplierData.ingredient_supplier_prices || [],
    };

    suppliers.push(newSupplier);
    await writeData(suppliers);

    return NextResponse.json({ data: newSupplier }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal error", details: e.message },
      { status: 500 }
    );
  }
}