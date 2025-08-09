import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
 const { id } = await context.params;


  try {
    const body = await req.json();

    const {
      username,
      email,
      telefono,
      direccion,
      zona,
      referencias,
      role,
    } = body;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.STRAPI_PEDIDOS_TOKEN;
    
    const validRoles = ["Authenticated", "Administrador", "Empleado"];
    let roleId = null;

    if (typeof role === "string" && validRoles.includes(role)) {
      const resRole = await fetch(`${backendUrl}/api/users-permissions/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roles = await resRole.json();
      roleId = roles.roles.find((r: any) => r.name === role)?.id;
    }

    const res = await fetch(`${backendUrl}/api/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        telefono,
        direccion,
        zona,
        referencias,
        ...(roleId && { role: roleId }),
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: json }, { status: res.status });
    }

    return NextResponse.json(json);
  } catch (err) {
    console.error("❌ Error al actualizar usuario:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
