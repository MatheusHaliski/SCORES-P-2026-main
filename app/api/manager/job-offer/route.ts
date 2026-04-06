import { NextRequest, NextResponse } from "next/server";
import { SeasonFlowService } from "@/services/SeasonFlowService";

export async function GET(request: NextRequest) {
  try {
    const saveId = request.nextUrl.searchParams.get("saveId");
    if (!saveId) return NextResponse.json({ error: "saveId é obrigatório" }, { status: 400 });

    const pending = await new SeasonFlowService().getPendingJobOffer(saveId);
    return NextResponse.json({ pending });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao obter proposta" }, { status: 500 });
  }
}
