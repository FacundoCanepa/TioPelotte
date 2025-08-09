// app/api/pedidos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const { id: documentId } = await context.params;
  try {
    const body = await req.json();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.STRAPI_PEDIDOS_TOKEN;

    const url = `${backendUrl}/api/pedidos/${documentId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: body }),
    });

    const json = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: json.error }, { status: response.status });
    }

    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
