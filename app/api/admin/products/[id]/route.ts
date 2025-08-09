import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const {
    id: _,
    documentId,
    createdAt,
    updatedAt,
    publishedAt,
    img,
    img_carousel,
    category,
    recetas,
    ...rest
  } = body;

  const cleanBody = {
    ...rest,
    img: typeof img === 'object' && img?.[0]?.id ? img[0].id : img,
    img_carousel: Array.isArray(img_carousel)
      ? img_carousel.map((i) => i.id)
      : [],
    category: typeof category === 'object' ? category.id : category,
    recetas: Array.isArray(recetas) ? recetas.map((r) => r.id) : [],
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({ data: cleanBody }),
      }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (res.status === 204) {
      return new Response(null, { status: 204 });
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ DELETE /products/[id] error:", err);
    return new Response("Error interno del servidor", { status: 500 });
  }
}