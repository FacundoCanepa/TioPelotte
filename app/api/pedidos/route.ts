import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pedidos?populate=*`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_PEDIDOS_TOKEN}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}