import { NextResponse } from "next/server";
import { z } from "zod";
import { getTask, updateStatus } from "@/services/task-service";
import { isTaskStatus } from "@/lib/types";

const bodySchema = z.object({
  status: z.string(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid JSON body",
            code: "INVALID_BODY",
          },
        },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid request body",
            code: "INVALID_BODY",
          },
        },
        { status: 400 },
      );
    }

    const { status } = parsed.data;

    if (!isTaskStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Invalid status. Must be one of: pending, in-progress, done",
            code: "INVALID_STATUS",
          },
        },
        { status: 400 },
      );
    }

    const existing = getTask(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Task not found", code: "NOT_FOUND" },
        },
        { status: 404 },
      );
    }

    const updated = updateStatus(id, status);
    return NextResponse.json({
      success: true,
      data: { task: updated },
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
