export const notifyAuthRefresh = () => {
  if (typeof window === "undefined") return;

  window.postMessage("AUTH_REFRESH", window.location.origin);
};
