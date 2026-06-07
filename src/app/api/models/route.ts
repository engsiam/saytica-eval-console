import { NextResponse } from "next/server";
import { z } from "zod";
import { getModels, getProvidersList } from "@/services/model-service";
import { isSortField } from "@/lib/types";

const querySchema = z.object({
  search: z.string().optional(),
  provider: z.string().optional(),
  sortField: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      provider: searchParams.get("provider") ?? undefined,
      sortField: searchParams.get("sortField") ?? undefined,
      sortDirection: searchParams.get("sortDirection") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid query parameters",
            code: "INVALID_PARAMS",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const { search, provider, sortField, sortDirection } = parsed.data;

    if (sortField && !isSortField(sortField)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Invalid sort field. Must be one of: accuracy, latency, costPer1k, evaluatedAt`,
            code: "INVALID_SORT_FIELD",
          },
        },
        { status: 400 },
      );
    }

    const models = getModels({
      search,
      provider,
      sortField: sortField as "accuracy" | "latency" | "costPer1k" | "evaluatedAt" | undefined,
      sortDirection,
    });

    const providers = getProvidersList();

    return NextResponse.json({
      success: true,
      data: { models, providers },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Internal server error", code: "INTERNAL_ERROR" },
      },
      { status: 500 },
    );
  }
}
