"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ConsentStatus = "accepted" | "rejected";

const CONSENT_STORAGE_KEY = "chatkeep_cookie_consent_v1";
const CONSENT_COOKIE_NAME = "chatkeep_cookie_consent";
const CONSENT_EVENT = "chatkeep:cookie-consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const GOOGLE_ANALYTICS_SCRIPT_ID = "chatkeep-google-analytics";
const GOOGLE_ANALYTICS_INIT_ID = "chatkeep-google-analytics-init";
const CLARITY_SCRIPT_ID = "chatkeep-clarity";

const GA_COOKIES = ["_ga", "_gid", "_gat"];

const writeConsentCookie = (status: ConsentStatus) => {
  document.cookie = `${CONSENT_COOKIE_NAME}=${status}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax; Secure`;
};

const persistConsent = (status: ConsentStatus) => {
  localStorage.setItem(CONSENT_STORAGE_KEY, status);
  writeConsentCookie(status);
};

const readConsent = (): ConsentStatus | null => {
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === "accepted" || stored === "rejected") {
    return stored;
  }
  return null;
};

const deleteCookie = (name: string) => {
  const host = window.location.hostname;
  const baseDomain = host.split(".").slice(-2).join(".");
  const domainCandidates = [host, `.${host}`];

  if (baseDomain && baseDomain !== host) {
    domainCandidates.push(baseDomain, `.${baseDomain}`);
  }

  for (const domain of domainCandidates) {
    document.cookie = `${name}=; Path=/; Domain=${domain}; Max-Age=0; SameSite=Lax`;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const applyRejectedSideEffects = () => {
  for (const gaCookie of GA_COOKIES) {
    deleteCookie(gaCookie);
  }
};

const loadGoogleAnalytics = (measurementId: string) => {
  if (document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) {
    return;
  }

  const gaScript = document.createElement("script");
  gaScript.id = GOOGLE_ANALYTICS_SCRIPT_ID;
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(gaScript);

  const initScript = document.createElement("script");
  initScript.id = GOOGLE_ANALYTICS_INIT_ID;
  initScript.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', { anonymize_ip: true });
  `;
  document.head.appendChild(initScript);
};

const loadClarity = (projectId: string) => {
  if (document.getElementById(CLARITY_SCRIPT_ID)) {
    return;
  }

  const clarityScript = document.createElement("script");
  clarityScript.id = CLARITY_SCRIPT_ID;
  clarityScript.async = true;
  clarityScript.src = `https://www.clarity.ms/tag/${projectId}`;
  document.head.appendChild(clarityScript);
};

const dispatchConsentChange = (status: ConsentStatus) => {
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { status } }));
};

export function CookieConsentBanner({ gaId, clarityId }: { gaId?: string; clarityId?: string }) {
  const [consent, setConsent] = useState<ConsentStatus | null>(() => {
    if (typeof window === "undefined") return null;
    return readConsent();
  });

  const hasAnalytics = useMemo(() => Boolean(gaId || clarityId), [gaId, clarityId]);

  useEffect(() => {
    if (consent === "accepted") {
      if (gaId) loadGoogleAnalytics(gaId);
      if (clarityId) loadClarity(clarityId);
      return;
    }

    if (consent === "rejected") {
      applyRejectedSideEffects();
    }
  }, [consent, gaId, clarityId]);

  const handleDecision = (status: ConsentStatus) => {
    persistConsent(status);
    setConsent(status);
    dispatchConsentChange(status);

    if (status === "accepted") {
      if (gaId) loadGoogleAnalytics(gaId);
      if (clarityId) loadClarity(clarityId);
      return;
    }

    applyRejectedSideEffects();
  };

  if (consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:p-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">我们重视你的隐私</p>
          <p className="text-sm text-neutral-300">
            我们仅在你同意后启用分析 Cookie（Google Analytics 与 Microsoft
            Clarity），用于改进产品体验；拒绝后仅保留站点必要功能 Cookie。你的选择会保存 12 个月。
            <Link href="/privacy" className="ml-1 underline hover:text-white">
              查看隐私政策
            </Link>
          </p>
          {!hasAnalytics ? (
            <p className="text-xs text-neutral-400">
              当前环境未配置分析脚本，接受后不会额外加载追踪。
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pb-1">
          <button
            type="button"
            onClick={() => handleDecision("rejected")}
            className="rounded-md border border-neutral-500 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-300 hover:text-white"
          >
            拒绝
          </button>
          <button
            type="button"
            onClick={() => handleDecision("accepted")}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
          >
            接受
          </button>
        </div>
      </div>
    </div>
  );
}
