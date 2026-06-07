import { NextResponse } from "next/server";
import { z } from "zod";
import { getTasks, getClientSummary } from "@/services/task-service";

const querySchema = z.object({
  view: z.enum(["annotator", "client"]).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      view: searchParams.get("view") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid query parameters",
            code: "INVALID_PARAMS",
          },
        },
        { status: 400 },
      );
    }

    const { view } = parsed.data;

    if (view === "client") {
      const summary = getClientSummary();
      return NextResponse.json({
        success: true,
        data: { view: "client" as const, summary },
      });
    }

    const tasks = getTasks();
    return NextResponse.json({
      success: true,
      data: { view: "annotator" as const, tasks },
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
