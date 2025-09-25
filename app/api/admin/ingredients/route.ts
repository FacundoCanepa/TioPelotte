import { NextRequest, NextResponse } from "next/server";
import { IngredientType } from "@/types/ingredient";
import { mapIngredientFromStrapi, strapiFetch } from "../suppliers/strapi-helpers";

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

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
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

  if (typeof value === "object") {
    if (value.id !== undefined && value.id !== null) {
      return buildSingleRelation(value.id as RelationInput);
    }

    if (value.documentId) {
      return { connect: [{ documentId: value.documentId }] };
    }
  }

  return undefined;
}

// Helper to build the Strapi URL for listing ingredients
function buildStrapiListURL(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "50");
  const q = (searchParams.get("q") || "").trim();
  const categoryId = (searchParams.get("categoryId") || "").trim();
  const sp = new URLSearchParams();

  sp.set("populate", "*");

  if (q) {
    sp.set("filters[ingredienteName][$containsi]", q);
  }

  if (categoryId) {
    sp.set("filters[categoria_ingrediente][id][$eq]", categoryId);
  }

  sp.set("pagination[page]", String(page));
  sp.set("pagination[pageSize]", String(pageSize));
  sp.set("sort[0]", "updatedAt:desc");

  return `/api/ingredientes?${sp.toString()}`;
}

// GET request handler to fetch ingredients
export async function GET(req: NextRequest) {
  try {
    const strapiUrl = buildStrapiListURL(req.nextUrl.searchParams);
    const response = await strapiFetch(strapiUrl);

    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ message: "Invalid JSON response from Strapi" }));
      console.error("[INGREDIENTS_GET] Strapi Error:", {
        status: response.status,
        body: errorBody,
      });
      return NextResponse.json(
        {
          ok: false,
          message:
            errorBody?.error?.message ||
            "Error fetching ingredients from Strapi",
        },
        { status: response.status }
      );
    }

    const strapiResponse = await response.json();
    const rawItems: unknown[] = Array.isArray(strapiResponse?.data)
    ? strapiResponse.data
    : [];
  const items = rawItems
    .map((entry: unknown) => mapIngredientFromStrapi(entry))
    .filter((item): item is IngredientType => Boolean(item));

  const meta = strapiResponse?.meta ?? {};
  const paginationRaw =
    (meta as { pagination?: Record<string, unknown> })?.pagination ?? {};
  const totalCount =
    typeof paginationRaw.total === "number"
      ? (paginationRaw.total as number)
      : items.length;
    // Transform the response to match what the client-side code expects
    const responsePayload = {
      items,
      meta: {
        ...meta,
        pagination: {
          page:
            typeof paginationRaw.page === "number"
              ? paginationRaw.page
              : 1,
          pageSize:
            typeof paginationRaw.pageSize === "number"
              ? paginationRaw.pageSize
              : items.length,
          pageCount:
            typeof paginationRaw.pageCount === "number"
              ? paginationRaw.pageCount
              : 1,
          total: totalCount,
        },
      },
      totalCount,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("[INGREDIENTS_GET] Internal Error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to create an ingredient in Strapi
async function createIngredient(data: any) {
  const res = await strapiFetch("/api/ingredientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const responseBody = await res.json();
  if (!res.ok) {
    console.error("Strapi [createIngredient] error:", responseBody);
    throw new Error(
      responseBody?.error?.message || "Failed to create ingredient in Strapi."
    );
  }
  return responseBody;
}

// Helper to create an ingredient price in Strapi
async function createIngredientSupplierPrice(data: any) {
  const res = await strapiFetch("/api/ingredient-supplier-prices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const responseBody = await res.json();
  if (!res.ok) {
    console.error(
      "Strapi [createIngredientSupplierPrice] error:",
      responseBody
    );
    throw new Error(
      responseBody?.error?.message ||
        "Failed to create ingredient price in Strapi."
    );
  }
  return responseBody;
}

// POST request handler to create an ingredient and its price
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const normalizeString = (value: unknown) =>
      typeof value === "string" ? value.trim() : "";

    const unidadMedidaValue = normalizeString(body.unidadMedida);

    const quantityNetoValue =
      typeof body.quantityNeto === "number" && Number.isFinite(body.quantityNeto)
        ? body.quantityNeto
        : null;

    const ingredientData = {
      ingredienteName: body.ingredienteName,
      ingredienteNameProducion: body.ingredienteNameProducion,
      Stock: body.Stock,
      unidadMedida: unidadMedidaValue,
      quantityNeto: quantityNetoValue,
      categoria_ingrediente: buildSingleRelation(body.categoria_ingrediente),
      supplier: buildSingleRelation(body.supplier),
      precio: body.precio,
    };

    const createdIngredientResponse = await createIngredient(ingredientData);
    const newIngredientId = createdIngredientResponse?.data?.id;

    if (!newIngredientId) {
      throw new Error("Ingredient creation did not return a valid ID.");
    }
    const createdAttributes = createdIngredientResponse?.data?.attributes;
    const unitFromResponse = normalizeString(createdAttributes?.unidadMedida);
    const resolvedUnit = unitFromResponse || unidadMedidaValue;

    const priceData = {
      unitPrice: body.precio,
      currency: "ARS",
      unit: resolvedUnit,
      ingrediente: newIngredientId,
      supplier: buildSingleRelation(body.supplier),
      categoria_ingrediente: buildSingleRelation(body.categoria_ingrediente), // This was the missing field
    };

    await createIngredientSupplierPrice(priceData);

    return NextResponse.json({ ok: true, data: createdIngredientResponse.data });
  } catch (error: any) {
    console.error("[INGREDIENTS_POST] Internal Error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
