import { NextResponse } from "next/server";
import { getTasks, getClientSummary } from "@/services/task-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "client") {
    const summary = getClientSummary();
    return NextResponse.json({ view: "client", summary });
  }

  const tasks = getTasks();
  return NextResponse.json({ view: "annotator", tasks });
}
