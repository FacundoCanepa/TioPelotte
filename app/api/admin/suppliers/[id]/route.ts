
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET a single supplier by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { ingredientes: true },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: supplier });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error inesperado', details: e.message }, { status: 500 });
  }
}

// PATCH (update) an existing supplier
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    const body = await req.json();
    const { name, phone, active, ingredientes } = body;

    const currentSupplier = await prisma.supplier.findUnique({
        where: { id },
        include: { ingredientes: true },
    });

    if (!currentSupplier) {
        return NextResponse.json({ error: 'Proveedor no encontrado para actualizar' }, { status: 404 });
    }

    // IDs of ingredients currently associated with the supplier
    const currentIngredientIds = currentSupplier.ingredientes.map(ing => ing.id);
    // IDs of ingredients coming from the form
    const newIngredientIds = ingredientes?.map((ing: { id: number }) => ing.id) || [];

    const ingredientsToDisconnect = currentIngredientIds.filter(id => !newIngredientIds.includes(id));
    const ingredientsToConnect = newIngredientIds.filter(id => !currentIngredientIds.includes(id));

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        phone,
        active,
        ingredientes: {
          disconnect: ingredientsToDisconnect.map(id => ({ id })),
          connect: ingredientsToConnect.map(id => ({ id })),
        },
      },
      include: {
        ingredientes: true,
      },
    });

    return NextResponse.json({ data: updatedSupplier });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error inesperado al actualizar', details: e.message }, { status: 500 });
  }
}

// DELETE a supplier
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    await prisma.supplier.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (e: any) {
    // Handle cases where the supplier is not found or other db errors
    return NextResponse.json({ error: 'Error inesperado al eliminar', details: e.message }, { status: 500 });
  }
}
