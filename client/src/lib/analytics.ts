// ============================================
// GA4 EVENT TRACKING via gtag.js
// All custom events flow to Google Analytics 4
// ============================================

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Send event to GA4 via gtag
function pushEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params ?? {});
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
