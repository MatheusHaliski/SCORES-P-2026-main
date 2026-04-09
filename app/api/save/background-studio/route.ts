import { NextRequest, NextResponse } from "next/server";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { BackgroundStudioConfig } from "@/types/backgroundStudio";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { saveId, config } = body as { saveId?: string; config?: BackgroundStudioConfig };
    if (!saveId || !config) {
      return NextResponse.json({ ok: false, message: "Dados inválidos" }, { status: 400 });
    }

    new UserSavesRepository().upsertBackgroundStudioConfig(saveId, config);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Falha ao salvar background studio", error: String(error) }, { status: 500 });
  }
}
