
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { SupplierType } from '@/types/supplier';

const dataFilePath = path.join(process.cwd(), 'data', 'suppliers.json');

async function readData(): Promise<SupplierType[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file does not exist, return an empty array
    return [];
  }
}

async function writeData(data: SupplierType[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// GET all suppliers
export async function GET(req: NextRequest) {
  const suppliers = await readData();
  // Implement search and pagination if needed
  // For now, returning all as per the simple data structure
  return NextResponse.json({ items: suppliers, meta: { pagination: { total: suppliers.length } } });
}

// POST a new supplier
export async function POST(req: NextRequest) {
  try {
    const suppliers = await readData();
    const newSupplierData = await req.json();

    // Basic validation
    if (!newSupplierData.name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
    const newSupplier: SupplierType = {
      ...newSupplierData,
      id: newId,
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
