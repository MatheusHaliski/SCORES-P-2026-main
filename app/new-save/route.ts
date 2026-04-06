import { NextRequest, NextResponse } from "next/server";
import { createNewSaveId } from "@/lib/saveId";

export async function GET(request: NextRequest) {
  const leagueId = request.nextUrl.searchParams.get("leagueId");
  const teamId = request.nextUrl.searchParams.get("teamId");

  if (!leagueId || !teamId) {
    return NextResponse.redirect(new URL("/select-team", request.url));
  }

  const saveId = createNewSaveId({ leagueId, teamId, seed: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` });
  return NextResponse.redirect(new URL(`/squad?saveId=${saveId}`, request.url));
}
