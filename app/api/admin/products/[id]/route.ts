import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const body = await req.json();

  const {
    id,
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

    img: typeof img === "object" && img?.[0]?.id ? img[0].id : img,
    img_carousel: Array.isArray(img_carousel) ? img_carousel.map((i) => i.id) : [],
    category: typeof category === "object" ? category.id : category,
    recetas: Array.isArray(recetas) ? recetas.map((r) => r.id) : [],
  };


  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${params.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_PEDIDOS_TOKEN}`,
      },
      body: JSON.stringify({ data: cleanBody }),
    }
  );

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    });


    if (res.status === 204) {
      return new Response(null, { status: 204 });
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    return new Response(JSON.stringify(data), {
      status: res.status,
    });
  } catch (error) {
    console.error("❌ Error en DELETE /api/admin/products/[id]:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}