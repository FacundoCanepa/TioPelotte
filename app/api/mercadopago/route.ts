import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const {
      items,
      tipoEntrega,
      zona,
      direccion,
      referencias,
      tipoPago,
      total,
      nombre,
      telefono,
      userId,
    } = await req.json();

    const itemsProcesados = items.map((item: any) => {
      const precio = tipoPago === "efectivo"
        ? Math.round(item.unit_price * 0.1)
        : item.unit_price;

      return {
        title: item.title,
        quantity: 1,
        unit_price: precio,
        productName: item.productName,
      };
    });

    const metadata = {
      cart: itemsProcesados,
      tipoEntrega,
      zona,
      direccion,
      referencias,
      tipoPago,
      total,
      nombre,
      telefono,
      userId,
    };
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

    console.log("🌐 baseUrl:", baseUrl);

    const { id, init_point } = await new Preference(mp).create({
      body: {
        items: itemsProcesados,
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        auto_return: "approved",
        metadata,
        statement_descriptor: "TIO PELOTTE",
      },
    });

    return NextResponse.json({ id, url: init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return NextResponse.json(
      { error: "Error al crear preferencia", detalle: error },
      { status: 500 }
    );
  }
}
