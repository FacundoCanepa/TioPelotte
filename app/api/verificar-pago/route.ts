import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_id } = body;

    if (!payment_id) {
      return NextResponse.json(
        { error: "payment_id requerido" },
        { status: 400 }
      );
    }

    const resPago = await fetch(
      `https://api.mercadopago.com/v1/payments/${payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const dataPago = await resPago.json();

    if (dataPago.status !== "approved") {
      return NextResponse.json({ error: "Pago no aprobado" }, { status: 400 });
    }

    const metadata = dataPago.metadata;

    const yaExiste = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pedidos?filters[payment_id][$eq]=${payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      }
    );

    const existeData = await yaExiste.json();

    if (existeData?.data?.length > 0) {
      return NextResponse.json({ status: "ok", message: "Pedido ya creado" });
    }

    const payload = {
      data: {
        items: metadata.cart,
        tipoEntrega: metadata.tipoEntrega,
        zona: metadata.zona,
        direccion: metadata.direccion,
        referencias: metadata.referencias,
        tipoPago: metadata.tipoPago,
        total: metadata.total,
        payment_id,
        estado: "Pendiente",
        nombre: metadata.nombre,
        telefono: metadata.telefono,
        user: metadata.userId || null,
      },
    };

    const crear = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pedidos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await crear.json();

    return NextResponse.json({ status: "ok", pedidoId: result?.data?.id });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}