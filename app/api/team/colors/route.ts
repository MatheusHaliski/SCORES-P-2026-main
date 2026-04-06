import { NextRequest, NextResponse } from "next/server";
import { TeamsRepository } from "@/repositories/TeamsRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, primaryColor, secondaryColor } = body as { teamId?: string; primaryColor?: string; secondaryColor?: string };
    if (!teamId || !primaryColor || !secondaryColor) {
      return NextResponse.json({ ok: false, message: "Dados inválidos" }, { status: 400 });
    }

    await new TeamsRepository().updateTeamColors(teamId, primaryColor, secondaryColor);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Falha ao atualizar cores", error: String(error) }, { status: 500 });
  }
}
