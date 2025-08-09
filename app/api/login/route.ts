import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();

  try {
    // Login en Strapi
    const resLogin = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const loginData = await resLogin.json();

    if (!resLogin.ok) {
      return NextResponse.json({ error: loginData.error.message }, { status: 400 });
    }

    const jwt = loginData.jwt;
    const userId = loginData.user.id;

    // Traer usuario completo con rol
    const resUser = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}?populate=role`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!resUser.ok) {
      return NextResponse.json({ error: "No se pudo obtener el rol del usuario" }, { status: 400 });
    }

    const user = await resUser.json();

    return NextResponse.json({ jwt, user });
  } catch (err) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
