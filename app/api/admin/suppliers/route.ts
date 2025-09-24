
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
    const suppliers = await readData();
    const { searchParams } = req.nextUrl;

    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // 1. Filter by search query
    const filteredSuppliers = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(search.toLowerCase())
    );

    // 2. Paginate the results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    // 3. Construct the response
    return NextResponse.json({
      items: paginatedSuppliers,
      meta: {
        pagination: {
          total: filteredSuppliers.length,
          page,
          limit,
        },
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

    return NextResponse.json({ data: newSupplier }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error', details: e.message }, { status: 500 });
  }
}
