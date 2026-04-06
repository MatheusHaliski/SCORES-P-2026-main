import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";
import { ManagerJobOffer } from "@/types/game";

const offersBySave = new Map<string, ManagerJobOffer[]>();

export class ManagerJobOffersRepository {
  async getPendingOffer(saveId: string): Promise<ManagerJobOffer | null> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: consultar manager_job_offers por saveId + status == pending.
    }

    const list = offersBySave.get(saveId) ?? [];
    return list.find((offer) => offer.status === "pending") ?? null;
  }

  async createOffer(offer: ManagerJobOffer): Promise<ManagerJobOffer> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: salvar manager_job_offers/{offer.id}.
    }

    const list = offersBySave.get(offer.saveId) ?? [];
    list.push(offer);
    offersBySave.set(offer.saveId, list);
    return offer;
  }

  async updateOfferStatus(saveId: string, offerId: string, status: ManagerJobOffer["status"]): Promise<ManagerJobOffer | null> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: atualizar status da proposta no Firebase.
    }

    const list = offersBySave.get(saveId) ?? [];
    const index = list.findIndex((offer) => offer.id === offerId);
    if (index < 0) return null;

    const updated: ManagerJobOffer = {
      ...list[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    offersBySave.set(saveId, list);
    return updated;
  }
}
