import { NextRequest, NextResponse } from "next/server";

const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
const token = process.env.STRAPI_PEDIDOS_TOKEN!;

type RelationInput =
  | number
  | string
  | {
      id?: number | string | null;
      documentId?: string | null;
    }
  | null
  | undefined;

function buildSingleRelation(value: RelationInput) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const numericValue = Number(trimmed);
    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }

    return { connect: [{ documentId: trimmed }] };
  }

  if (typeof value === 'object') {
    if (value.id !== undefined && value.id !== null) {
      return buildSingleRelation(value.id as RelationInput);
    }

    if (value.documentId) {
      return { connect: [{ documentId: value.documentId }] };
    }
  }

  return undefined;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 
  try {
    const body = await req.json();
    console.log("📥 PUT recibido body:", body);
    console.log("🆔 Params (documentId):", id);

    const quantityNetoValue =
      typeof body.quantityNeto === "number" && Number.isFinite(body.quantityNeto)
        ? body.quantityNeto
        : null;

    const data = {
      ingredienteName: body.ingredienteName,
      ingredienteNameProducion: body.ingredienteNameProducion,
      Stock: body.Stock,
      unidadMedida: body.unidadMedida,
      precio: body.precio,
      quantityNeto: quantityNetoValue,
      categoria_ingrediente: buildSingleRelation(body.categoria_ingrediente),
      supplier: buildSingleRelation(body.supplier),
    };

    const res = await fetch(`${backend}/api/ingredientes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });

    const json = await res.json();
    console.log("✅ Respuesta PUT:", json);
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error("🔥 Error en PUT:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    console.log("🗑️ DELETE recibido para:", id);

    const res = await fetch(`${backend}/api/ingredientes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 204) {
      console.log("✅ Ingrediente eliminado correctamente");
      return new Response(null, { status: 204 });
    }

    const json = await res.json();
    console.log("⚠️ Respuesta DELETE (no 204):", json);
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error("🔥 Error en DELETE:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}