
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all suppliers with pagination and search
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('limit') || '10');
  const q = searchParams.get('q');

  const where: any = {};
  if (q) {
    where.name = {
      contains: q,
      mode: 'insensitive',
    };
  }

  try {
    const [suppliers, total] = await prisma.$transaction([
      prisma.supplier.findMany({
        where,
        include: {
          ingredientes: true, // Include related ingredients
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          id: 'desc',
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    const payload = {
      items: suppliers,
      meta: {
        pagination: {
          page,
          pageSize,
          total,
          pageCount: Math.ceil(total / pageSize),
        },
      },
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error('[api/admin/suppliers][GET] unexpected error:', e);
    return NextResponse.json({ error: 'Error inesperado', details: String(e) }, { status: 500 });
  }
}

// POST a new supplier
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, active, ingredientes } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name,
        phone,
        active,
        ingredientes: {
          connect: ingredientes?.map((ing: { id: number }) => ({ id: ing.id })) || [],
        },
      },
      include: {
        ingredientes: true,
      },
    });

    return NextResponse.json({ data: newSupplier }, { status: 201 });
  } catch (e: any) {
    console.error('[api/admin/suppliers][POST] unexpected error:', e);
    return NextResponse.json({ error: 'Internal error', details: e?.message ?? String(e) }, { status: 500 });
  }
}
