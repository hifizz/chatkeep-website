import { and, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { shareLink, user } from "~/server/db/schema";
import type { QuotaDbClient } from "~/server/billing/quota";

export type ShareLinkRecord = typeof shareLink.$inferSelect;
export type ShareLinkInsert = typeof shareLink.$inferInsert;

export const insertShare = async (input: ShareLinkInsert, client: QuotaDbClient = db) => {
  const rows = await client.insert(shareLink).values(input).returning();
  return rows[0] ?? null;
};

export const listSharesByOwner = async (ownerUserId: string) => {
  return db
    .select()
    .from(shareLink)
    .where(eq(shareLink.ownerUserId, ownerUserId))
    .orderBy(desc(shareLink.createdAt));
};

export const getShareById = async (shareId: string) => {
  const rows = await db.select().from(shareLink).where(eq(shareLink.id, shareId)).limit(1);
  return rows[0] ?? null;
};

export type SharePublicRecord = {
  share: ShareLinkRecord;
  owner: {
    name: string | null;
    image: string | null;
  } | null;
};

export const getSharePublicById = async (shareId: string): Promise<SharePublicRecord | null> => {
  const rows = await db
    .select({
      share: shareLink,
      ownerName: user.name,
      ownerImage: user.image,
    })
    .from(shareLink)
    .leftJoin(user, eq(shareLink.ownerUserId, user.id))
    .where(eq(shareLink.id, shareId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    share: row.share,
    owner: row.ownerName || row.ownerImage ? { name: row.ownerName, image: row.ownerImage } : null,
  };
};

export const getShareByIdForOwner = async (shareId: string, ownerUserId: string) => {
  const rows = await db
    .select()
    .from(shareLink)
    .where(and(eq(shareLink.id, shareId), eq(shareLink.ownerUserId, ownerUserId)))
    .limit(1);
  return rows[0] ?? null;
};

export const markShareRevoked = async (shareId: string, ownerUserId: string) => {
  const rows = await db
    .update(shareLink)
    .set({
      status: "revoked",
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(shareLink.id, shareId), eq(shareLink.ownerUserId, ownerUserId)))
    .returning();

  return rows[0] ?? null;
};

export const markShareExpired = async (shareId: string) => {
  const rows = await db
    .update(shareLink)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(eq(shareLink.id, shareId))
    .returning();

  return rows[0] ?? null;
};

export const deleteShare = async (shareId: string, ownerUserId: string) => {
  const rows = await db
    .delete(shareLink)
    .where(and(eq(shareLink.id, shareId), eq(shareLink.ownerUserId, ownerUserId)))
    .returning();

  return rows[0] ?? null;
};
