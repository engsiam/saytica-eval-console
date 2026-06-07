import { NextResponse } from "next/server";
import { getModels, getProvidersList } from "@/services/model-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") ?? undefined;
  const provider = searchParams.get("provider") ?? undefined;
  const sortField = searchParams.get("sortField") ?? undefined;
  const sortDirection = searchParams.get("sortDirection") ?? undefined;

  const validSortFields = ["accuracy", "latency", "costPer1k", "evaluatedAt"];
  const validDirections = ["asc", "desc"];

  const models = getModels({
    search,
    provider,
    sortField: validSortFields.includes(sortField ?? "")
      ? (sortField as "accuracy" | "latency" | "costPer1k" | "evaluatedAt")
      : undefined,
    sortDirection: validDirections.includes(sortDirection ?? "")
      ? (sortDirection as "asc" | "desc")
      : undefined,
  });

  const providers = getProvidersList();

  return NextResponse.json({ models, providers });
}
