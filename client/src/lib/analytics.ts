// ============================================
// GA4 + META PIXEL EVENT TRACKING
// GA4 via gtag.js, Meta via fbq
// ============================================

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
  }
}

// Send event to GA4 via gtag
function pushEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params ?? {});
  }
}

// Send event to Meta Pixel via fbq
function metaTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, params ?? {});
  }
}
function metaTrackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', event, params ?? {});
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
  pushEvent("cta_click", { button_name: "unlock_my_results", click_context: "step3_preview" });
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
}) {
  pushEvent("lead_form_submit", {
    wealth_goal: data.wealthGoal,
    investor_type: data.investorType,
    lead_score: data.leadScore,
    lead_temperature: data.temperature,
    investment_budget: data.investmentBudget,
  });
  // Meta Pixel: standard Lead event
  metaTrack("Lead", {
    content_name: "Property Wealth Snapshot",
    content_category: data.wealthGoal,
    value: data.investmentBudget,
    currency: "AUD",
  });
}

export function trackLeadFormError(errorType: string) {
  pushEvent("lead_form_error", { error_type: errorType });
}

// ── Results / Post-Conversion Events ──────────────

export function trackResultsView(tab: string) {
  pushEvent("results_tab_view", { tab_name: tab });
}

export function trackCalendlyClick() {
  pushEvent("cta_click", { button_name: "find_a_time", click_context: "results_calendly" });
  // Meta Pixel: standard Schedule event
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
