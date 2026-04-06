"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SaveSlotCard } from "@/components/SaveSlotCard";
import { getLS, setLS } from "@/app/lib/SafeStorage";
import { SaveSlot } from "@/services/SaveGameService";

const DELETED_SAVES_KEY = "scores:deleted_saves";

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
  const [deletedSaveIds, setDeletedSaveIds] = useState<Set<string>>(() => readDeletedSaveIds());

  const visibleSlots = useMemo(
    () => initialSlots.filter((slot) => !deletedSaveIds.has(slot.save.id)),
    [deletedSaveIds, initialSlots],
  );

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
