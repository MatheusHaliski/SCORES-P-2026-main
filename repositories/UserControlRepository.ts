import type { Firestore } from "firebase-admin/firestore";
import { removeUndefinedFields } from "@/lib/removeUndefinedFields";
import {
  type CreateUserControlPayload,
  type UpdateUserControlPayload,
  type UserControlRecord,
  USER_CONTROL_COLLECTION,
} from "@/types/UserControl";

export class UserControlRepository {
  constructor(private readonly db: Firestore) {}

  async getUserControlByUid(uid: string): Promise<UserControlRecord | null> {
    const snapshot = await this.db
      .collection(USER_CONTROL_COLLECTION)
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<UserControlRecord, "id">) };
  }

  async getUserControlByEmail(email: string): Promise<UserControlRecord | null> {
    const snapshot = await this.db
      .collection(USER_CONTROL_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<UserControlRecord, "id">) };
  }

  async createUserControl(payload: CreateUserControlPayload): Promise<UserControlRecord> {
    const sanitizedPayload = removeUndefinedFields(payload) as CreateUserControlPayload;
    const docRef = await this.db.collection(USER_CONTROL_COLLECTION).add(sanitizedPayload);
    return { id: docRef.id, ...sanitizedPayload };
  }

  async updateUserControl(id: string, payload: UpdateUserControlPayload): Promise<void> {
    const sanitizedPayload = removeUndefinedFields(payload) as UpdateUserControlPayload;
    await this.db.collection(USER_CONTROL_COLLECTION).doc(id).set(sanitizedPayload, { merge: true });
  }
}
