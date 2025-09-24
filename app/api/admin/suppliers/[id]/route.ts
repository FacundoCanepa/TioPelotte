
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
    return [];
  }
}

async function writeData(data: SupplierType[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// GET a single supplier
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const suppliers = await readData();
  const supplier = suppliers.find(s => s.id === parseInt(params.id));

  if (!supplier) {
    return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ data: supplier });
}


// PATCH (update) an existing supplier
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const suppliers = await readData();
    const supplierIndex = suppliers.findIndex(s => s.id === parseInt(params.id));

    if (supplierIndex === -1) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    const updatedData = await req.json();
    suppliers[supplierIndex] = { ...suppliers[supplierIndex], ...updatedData };
    
    await writeData(suppliers);

    return NextResponse.json({ data: suppliers[supplierIndex] });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error al actualizar', details: e.message }, { status: 500 });
  }
}

// DELETE a supplier
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const suppliers = await readData();
  const updatedSuppliers = suppliers.filter(s => s.id !== parseInt(params.id));

  if (suppliers.length === updatedSuppliers.length) {
    return NextResponse.json({ error: 'Proveedor no encontrado para eliminar' }, { status: 404 });
  }

  await writeData(updatedSuppliers);

  return new NextResponse(null, { status: 204 }); // No Content
}

