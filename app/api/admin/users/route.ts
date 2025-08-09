import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?populate=role`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_PEDIDOS_TOKEN}`,
      },
    });

    const usuarios = await res.json();
    console.log("👤 Usuarios obtenidos:", usuarios);

    return NextResponse.json({ data: usuarios });
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}
