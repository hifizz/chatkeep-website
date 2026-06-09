import { db } from "~/server/db";
import { artifact } from "~/server/db/schema";

/** 产物元数据入库（系统真相;供后续列表/撤销/付费）。 */
export interface ArtifactInsert {
  id: string;
  ownerUserId: string;
  blobHash: string;
  title: string;
  platform: string;
  kind: string;
  accessMode: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

export const insertArtifact = async (row: ArtifactInsert): Promise<void> => {
  await db.insert(artifact).values(row);
};
