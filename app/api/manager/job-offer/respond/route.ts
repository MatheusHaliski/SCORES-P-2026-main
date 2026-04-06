import { NextRequest, NextResponse } from "next/server";
import { SeasonFlowService } from "@/services/SeasonFlowService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { saveId?: string; offerId?: string; action?: "accept" | "reject" };

    if (!body.saveId || !body.offerId || !body.action) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const service = new SeasonFlowService();
    const offer = body.action === "accept"
      ? await service.acceptJobOffer(body.saveId, body.offerId)
      : await service.rejectJobOffer(body.saveId, body.offerId);

    return NextResponse.json({ offer, action: body.action });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao responder proposta" }, { status: 500 });
  }
}
