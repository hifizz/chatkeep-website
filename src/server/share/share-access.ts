const ACCESS_COOKIE_PREFIX = "chatkeep_share_access_";

export const getShareAccessCookieName = (shareId: string) => `${ACCESS_COOKIE_PREFIX}${shareId}`;

export const SHARE_ACCESS_COOKIE_MAX_AGE = 60 * 60 * 12;
