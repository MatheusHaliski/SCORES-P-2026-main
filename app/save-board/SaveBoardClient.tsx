"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SaveSlotCard } from "@/components/SaveSlotCard";
import { getLS, setLS } from "@/app/lib/SafeStorage";
import { SaveSlot } from "@/services/SaveGameService";
import { UserSave } from "@/types/game";
import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";

const DELETED_SAVES_KEY = "scores:deleted_saves";
const SAVE_SLOT_INDEX_KEY = "scores:save_slots:index";

const readDeletedSaveIds = () => {
  const raw = getLS(DELETED_SAVES_KEY);
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
};

export function SaveBoardClient({ initialSlots }: { initialSlots: SaveSlot[] }) {
  const [slots, setSlots] = useState<SaveSlot[]>(initialSlots);
  const [deletedSaveIds, setDeletedSaveIds] = useState<Set<string>>(() => readDeletedSaveIds());

  const visibleSlots = useMemo(
    () => slots.filter((slot) => !deletedSaveIds.has(slot.save.id)),
    [deletedSaveIds, slots],
  );

  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  useEffect(() => {
    const raw = getLS(SAVE_SLOT_INDEX_KEY);
    if (!raw) return;
    try {
      const indexed = JSON.parse(raw) as UserSave[];
      if (!Array.isArray(indexed) || indexed.length === 0) return;

      const teamsRepo = new TeamsRepository();
      const leaguesRepo = new LeaguesRepository();
      Promise.all(indexed.map(async (save) => {
        const [team, league] = await Promise.all([
          teamsRepo.getTeamById(save.teamId),
          leaguesRepo.getLeagueById(save.leagueId),
        ]);
        return { save, team: team ?? undefined, league: league ?? undefined } as SaveSlot;
      })).then((localSlots) => {
        setSlots((current) => {
          const map = new Map<string, SaveSlot>();
          current.forEach((slot) => map.set(slot.save.id, slot));
          localSlots.forEach((slot) => map.set(slot.save.id, slot));
          return Array.from(map.values()).sort((a, b) => (b.save.updatedAt || "").localeCompare(a.save.updatedAt || ""));
        });
      }).catch(() => undefined);
    } catch {
      // ignore invalid local index
    }
  }, []);

  const handleDelete = (saveId: string) => {
    setDeletedSaveIds((current) => {
      const next = new Set(current);
      next.add(saveId);
      setLS(DELETED_SAVES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  return (
    <>
      <div className="mt-5 space-y-3">
        {visibleSlots.map((slot) => (
          <SaveSlotCard
            key={slot.save.id}
            save={slot.save}
            team={slot.team}
            league={slot.league}
            onDelete={handleDelete}
          />
        ))}
        {!visibleSlots.length && (
          <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-4 text-sm text-slate-300">
            Nenhum save disponível na lista.
          </div>
        )}
      </div>
      <Link href="/select-team" className="mt-4 inline-block rounded bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
        Criar novo save
      </Link>
    </>
  );
}
