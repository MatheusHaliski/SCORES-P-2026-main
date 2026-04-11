import { NextRequest, NextResponse } from "next/server";
import { SaveGameService } from "@/services/SaveGameService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { saveId?: string; payload?: Parameters<SaveGameService["saveFullGameState"]>[1] };
    if (!body.saveId || !body.payload) {
      return NextResponse.json({ ok: false, message: "Dados inválidos" }, { status: 400 });
    }

    const result = await new SaveGameService().saveFullGameState(body.saveId, body.payload);
    if (!result.ok) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, message: `Falha ao salvar estado completo: ${String(error)}` }, { status: 500 });
  }
}
