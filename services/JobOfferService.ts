import { ManagerJobOffersRepository } from "@/repositories/ManagerJobOffersRepository";
import { StandingRow, UserSave } from "@/types/game";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";

const MIN_ROUND_FOR_OFFERS = 2;

export class JobOfferService {
  constructor(
    private offersRepository = new ManagerJobOffersRepository(),
    private teamsRepository = new TeamsRepository(),
    private savesRepository = new UserSavesRepository(),
  ) {}

  async generateJobOfferForRound(save: UserSave, round: number, standings: StandingRow[]) {
    if (save.employmentStatus === "employed" || round < MIN_ROUND_FOR_OFFERS) return null;

    const pending = await this.offersRepository.getPendingOffer(save.id);
    if (pending) return pending;

    const shouldGenerate = (round + save.dismissalCount) % 2 === 0;
    if (!shouldGenerate) return null;

    const candidates = standings
      .filter((row) => row.teamId !== save.lastDismissedClubId)
      .sort((a, b) => b.position - a.position)
      .slice(0, Math.max(3, Math.floor(standings.length / 4)));

    const target = candidates[0];
    if (!target) return null;

    const targetTeam = await this.teamsRepository.getTeamById(target.teamId);
    if (!targetTeam) return null;

    const now = new Date().toISOString();
    return this.offersRepository.createOffer({
      id: `offer-${save.id}-${round}-${target.teamId}`,
      saveId: save.id,
      clubId: target.teamId,
      clubName: targetTeam.name,
      leagueId: save.leagueId,
      currentLeaguePosition: target.position,
      offeredSalary: Math.round((targetTeam.budget * 0.03) / 12),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  }

  async getPendingJobOffer(saveId: string) {
    return this.offersRepository.getPendingOffer(saveId);
  }

  async acceptJobOffer(saveId: string, offerId: string) {
    const [save, offer] = await Promise.all([
      this.savesRepository.getSaveById(saveId),
      this.offersRepository.updateOfferStatus(saveId, offerId, "accepted"),
    ]);

    if (!save || !offer) throw new Error("Proposta não encontrada para aceite");

    this.savesRepository.upsertSaveProgress(saveId, {
      employmentStatus: "employed",
      isEmployed: true,
      currentClubId: offer.clubId,
      teamId: offer.clubId,
      boardReputation: 7,
      fansReputation: 6,
      roundsUnderCriticalBoard: 0,
      roundsUnderCriticalFans: 0,
      roundsUnderCriticalCombined: 0,
      updatedAt: new Date().toISOString(),
    });

    return offer;
  }

  async rejectJobOffer(saveId: string, offerId: string) {
    const offer = await this.offersRepository.updateOfferStatus(saveId, offerId, "rejected");
    if (!offer) throw new Error("Proposta não encontrada para recusa");
    return offer;
  }
}
