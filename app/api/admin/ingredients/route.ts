import { NextRequest, NextResponse } from "next/server";

const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
const token = process.env.STRAPI_PEDIDOS_TOKEN!;

export async function GET() {
  const res = await fetch(
    `${backend}/api/ingredientes?sort[0]=ingredienteName&pagination[pageSize]=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 POST recibido body:", body);

    const data = {
      ingredienteName: body.ingredienteName,
      Stock: body.Stock,
      unidadMedida: body.unidadMedida,
      precio: body.precio,
    };

    const res = await fetch(`${backend}/api/ingredientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });

    const json = await res.json();
    console.log("✅ Respuesta POST ingredientes:", json);
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error("🔥 Error en POST ingredientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
