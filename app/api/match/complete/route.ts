import { NextRequest, NextResponse } from "next/server";
import { SeasonFlowService } from "@/services/SeasonFlowService";
import { Fixture } from "@/types/game";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { saveId?: string; round?: number; fixtures?: Fixture[] };

    if (!body.saveId || typeof body.round !== "number" || !Array.isArray(body.fixtures)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const payload = await new SeasonFlowService().completeCurrentRound(body.saveId, body.round, body.fixtures);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao completar rodada" }, { status: 500 });
  }
}
