import { NextResponse } from "next/server";
import { getTask, updateStatus } from "@/services/task-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json();
  const { status } = body;

  if (!status || !["pending", "in-progress", "done"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 },
    );
  }

  const existing = getTask(id);
  if (!existing) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 },
    );
  }

  const updated = updateStatus(id, status);
  return NextResponse.json({ task: updated });
}
