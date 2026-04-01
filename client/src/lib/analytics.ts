// ============================================
// GA4 + META PIXEL + META CONVERSIONS API
// GA4 via gtag.js, browser pixel via fbq,
// server-side CAPI via /api/meta/event relay
// ============================================

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
  }
}

// Generate a unique event ID for Meta deduplication.
// The same ID is passed to both fbq() and the server-side CAPI route so
// Meta counts only one conversion even if both signals arrive.
function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Send event to GA4 via gtag
function pushEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params ?? {});
  }
}

// Send event to Meta browser pixel via fbq (with optional event ID for dedup)
function metaTrack(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window.fbq === "function") {
    if (eventId) {
      window.fbq("track", event, params ?? {}, { eventID: eventId });
    } else {
      window.fbq("track", event, params ?? {});
    }
  }
}

function metaTrackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", event, params ?? {});
  }
}

// Mirror an event to the server-side Conversions API relay.
// The server hashes all PII before forwarding to Facebook, bypassing
// browser ad-blockers and iOS tracking restrictions.
async function mirrorToCapiServer(opts: {
  eventName: string;
  eventId: string;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  customData?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/meta/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: opts.eventName,
        eventId: opts.eventId,
        eventSourceUrl: window.location.href,
        userData: opts.userData ?? {},
        customData: opts.customData ?? {},
      }),
    });
  } catch (err) {
    // CAPI is a supplementary signal — never block user flow on failure
    console.warn("[meta-capi] Server mirror failed:", err);
  }
}

// ── Step / Funnel Events ──────────────────────────

export function trackStepView(step: number, stepName: string) {
  pushEvent("calculator_step_view", {
    step_number: step,
    step_name: stepName,
  });
}

export function trackStepComplete(step: number, stepName: string) {
  pushEvent("calculator_step_complete", {
    step_number: step,
    step_name: stepName,
  });
  // Meta Pixel: track calculator completion as ViewContent
  if (step === 2) {
    metaTrack("ViewContent", { content_name: "Calculator Results" });
  }
}

// ── Qualification / Selection Events ──────────────

export function trackInvestorType(type: string) {
  pushEvent("select_investor_type", { investor_type: type });
}

export function trackOwnershipStatus(status: string) {
  pushEvent("select_ownership_status", { ownership_status: status });
}

export function trackEquityRange(range: string) {
  pushEvent("select_equity_range", { equity_range: range });
}

export function trackTimeline(timeline: string) {
  pushEvent("select_timeline", { investment_timeline: timeline });
}

export function trackWealthGoal(goal: string) {
  pushEvent("select_wealth_goal", { wealth_goal: goal });
}

// ── CTA / Button Click Events ─────────────────────

export function trackButtonClick(buttonName: string, context?: string) {
  pushEvent("cta_click", {
    button_name: buttonName,
    click_context: context ?? "",
  });
}

export function trackUnlockClick() {
  pushEvent("cta_click", {
    button_name: "unlock_my_results",
    click_context: "step3_preview",
  });
}

// ── Lead Capture Events ───────────────────────────

export function trackLeadFormOpen() {
  pushEvent("lead_form_open");
  metaTrackCustom("LeadFormOpen");
}

export function trackLeadFormSubmit(data: {
  wealthGoal: string;
  investorType: string;
  leadScore: number | null;
  temperature: string;
  investmentBudget: number;
  // User data for Advanced Matching + Conversions API
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}) {
  pushEvent("lead_form_submit", {
    wealth_goal: data.wealthGoal,
    investor_type: data.investorType,
    lead_score: data.leadScore,
    lead_temperature: data.temperature,
    investment_budget: data.investmentBudget,
  });

  const eventId = generateEventId();

  const customData = {
    content_name: "Property Wealth Snapshot",
    content_category: data.wealthGoal,
    value: data.investmentBudget,
    currency: "AUD",
  };

  const userData = {
    email: data.email,
    phone: data.phone,
    firstName: data.firstName,
    lastName: data.lastName,
  };

  if (typeof window.fbq === "function") {
    // Update Advanced Matching so Meta can link this conversion to a known user.
    // fbq hashes all user data client-side before transmission.
    if (data.email || data.phone || data.firstName || data.lastName) {
      window.fbq("init", "3390105951260014", {
        em: data.email?.toLowerCase().trim() ?? "",
        ph: data.phone?.replace(/\s+/g, "") ?? "",
        fn: data.firstName?.toLowerCase().trim() ?? "",
        ln: data.lastName?.toLowerCase().trim() ?? "",
      });
    }

    // Fire browser pixel with eventID for deduplication
    window.fbq("track", "Lead", customData, { eventID: eventId });
  }

  // Mirror to server-side Conversions API — runs in parallel, never blocks
  // the user. The server hashes PII and forwards to Facebook independently
  // of the browser, bypassing ad blockers and iOS privacy restrictions.
  mirrorToCapiServer({ eventName: "Lead", eventId, userData, customData });
}

export function trackLeadFormError(errorType: string) {
  pushEvent("lead_form_error", { error_type: errorType });
}

// ── Results / Post-Conversion Events ──────────────

export function trackResultsView(tab: string) {
  pushEvent("results_tab_view", { tab_name: tab });
}

export function trackCalendlyClick() {
  pushEvent("cta_click", {
    button_name: "find_a_time",
    click_context: "results_calendly",
  });
  metaTrack("Schedule", { content_name: "Clarity Call" });
}

// ── Utility: Track time on each step ──────────────

const stepTimers: Record<number, number> = {};

export function startStepTimer(step: number) {
  stepTimers[step] = Date.now();
}

export function endStepTimer(step: number): number {
  const start = stepTimers[step];
  if (!start) return 0;
  const seconds = Math.round((Date.now() - start) / 1000);
  pushEvent("step_time_spent", { step_number: step, seconds_spent: seconds });
  delete stepTimers[step];
  return seconds;
}
