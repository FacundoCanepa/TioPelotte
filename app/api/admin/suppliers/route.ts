
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { SupplierType } from '@/types/supplier';
import crypto from 'crypto';

const dataFilePath = path.join(process.cwd(), 'data', 'suppliers.json');

async function readData(): Promise<SupplierType[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return fileContent ? JSON.parse(fileContent) : [];
  } catch (error) {
    return [];
  }
}

async function writeData(data: SupplierType[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// GET all suppliers with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const allSuppliers = await readData();
    const { searchParams } = req.nextUrl;

    const search = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const activeFilter = searchParams.get('active');

    const filteredSuppliers = allSuppliers.filter(supplier => {
      const nameMatch = search ? supplier.name.toLowerCase().includes(search.toLowerCase()) : true;
      let activeMatch = true;
      if (activeFilter && activeFilter !== 'all') {
        activeMatch = String(supplier.active) === activeFilter;
      }
      return nameMatch && activeMatch;
    });

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    // Return response in Strapi-like format
    return NextResponse.json({
      data: paginatedSuppliers,
      meta: {
        pagination: {
          page: page,
          pageSize: pageSize,
          pageCount: Math.ceil(filteredSuppliers.length / pageSize),
          total: filteredSuppliers.length,
        },
        totalCount: allSuppliers.length,
        activeCount: allSuppliers.filter(s => s.active).length,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error', details: e.message }, { status: 500 });
  }
}

// POST a new supplier
export async function POST(req: NextRequest) {
  try {
    const suppliers = await readData();
    const newSupplierData = await req.json();

    if (!newSupplierData.name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const maxId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id || 0)) + 1 : 1;

    const newSupplier: SupplierType = {
      ...newSupplierData,
      id: maxId,
      documentId: crypto.randomUUID(),
      active: newSupplierData.active !== undefined ? newSupplierData.active : true,
      ingredientes: newSupplierData.ingredientes || [],
    };

    suppliers.push(newSupplier);
    await writeData(suppliers);

    // Return response in Strapi-like format
    return NextResponse.json({ data: newSupplier }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error', details: e.message }, { status: 500 });
  }
}
