import { NextRequest, NextResponse } from "next/server";

const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
const token = process.env.STRAPI_PEDIDOS_TOKEN;

export async function GET() {
  const res = await fetch(`${backend}/api/products?populate=*`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  try {
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
      ingredientes,
      ...rest
    } = body;

    const cleanBody = {
      ...rest,
      img: typeof img === "object" && img?.id ? img.id : img,
      img_carousel: Array.isArray(img_carousel)
        ? img_carousel.map((i) => i.id || i)
        : [],
      category: typeof category === "object" ? category.id : category,
      recetas: Array.isArray(recetas)
        ? recetas.map((r) => r.id || r)
        : [],
      ingredientes: Array.isArray(ingredientes)
        ? ingredientes.map((i) => i.id || i)
        : [],
    };

    const res = await fetch(`${backend}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: cleanBody }),
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("❌ Error interno al crear producto:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
