// ============================================
// LEAD SEGMENTATION, SCORING & PERSONALISATION
// ============================================

// --- Investor Types ---
export type InvestorType = 'first-time' | 'portfolio-builder';

// --- Qualification Fields ---
export type PropertyOwnership = 'own-home' | 'own-investment' | 'renting' | 'other';
export type EquityRange = 'under-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'over-500k';
export type InvestmentTimeline = 'immediately' | 'within-3-months' | 'within-6-months' | 'within-12-months' | 'just-exploring';

// --- Lead Score ---
export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';

export interface QualificationData {
  investorType: InvestorType | null;
  propertyOwnership: PropertyOwnership | null;
  equityRange: EquityRange | null;
  investmentTimeline: InvestmentTimeline | null;
}

export interface LeadScore {
  temperature: LeadTemperature;
  score: number; // 0-100
  reasons: string[];
}

// --- Lead Scoring Logic ---
export function calculateLeadScore(
  qualification: QualificationData,
  annualIncome: number,
  deposit: number,
): LeadScore {
  let score = 0;
  const reasons: string[] = [];

  // Timeline scoring (most important signal)
  switch (qualification.investmentTimeline) {
    case 'immediately':
      score += 35;
      reasons.push('Ready to act immediately');
      break;
    case 'within-3-months':
      score += 28;
      reasons.push('Looking within 3 months');
      break;
    case 'within-6-months':
      score += 18;
      reasons.push('6-month timeline');
      break;
    case 'within-12-months':
      score += 10;
      reasons.push('12-month timeline');
      break;
    case 'just-exploring':
      score += 3;
      reasons.push('Exploring options');
      break;
  }

  // Equity / deposit scoring
  switch (qualification.equityRange) {
    case 'over-500k':
      score += 25;
      reasons.push('Strong equity position (500k+)');
      break;
    case '200k-500k':
      score += 20;
      reasons.push('Solid equity ($200k-$500k)');
      break;
    case '100k-200k':
      score += 15;
      reasons.push('Moderate equity ($100k-$200k)');
      break;
    case '50k-100k':
      score += 8;
      reasons.push('Building equity ($50k-$100k)');
      break;
    case 'under-50k':
      score += 3;
      reasons.push('Early equity stage (under $50k)');
      break;
  }

  // Property ownership scoring
  switch (qualification.propertyOwnership) {
    case 'own-home':
      score += 15;
      reasons.push('Homeowner — can leverage equity');
      break;
    case 'own-investment':
      score += 20;
      reasons.push('Existing investor — portfolio builder');
      break;
    case 'renting':
      score += 5;
      reasons.push('Renter — first-time buyer pathway');
      break;
    case 'other':
      score += 3;
      break;
  }

  // Income scoring
  if (annualIncome >= 200000) {
    score += 10;
    reasons.push('High income ($200k+)');
  } else if (annualIncome >= 150000) {
    score += 8;
    reasons.push('Strong income ($150k+)');
  } else if (annualIncome >= 100000) {
    score += 5;
    reasons.push('Solid income ($100k+)');
  }

  score = Math.min(100, score);

  let temperature: LeadTemperature;
  if (score >= 60) {
    temperature = 'HOT';
  } else if (score >= 35) {
    temperature = 'WARM';
  } else {
    temperature = 'COLD';
  }

  return { temperature, score, reasons };
}

// --- Personalisation Copy ---
export interface PersonalisedCopy {
  step1Subtitle: string;
  step2Subtitle: string;
  resultsTitle: string;
  resultsSubtitle: string;
  fearHeadline: string;
  fearSubheadline: string;
  fearCtaText: string;
  ctaHeadline: string;
  ctaDescription: string;
  ctaBadge: string;
  ctaButtonText: string;
  testimonialQuote: string;
  testimonialName: string;
  testimonialDetail: string;
}

export function getPersonalisedCopy(
  investorType: InvestorType | null,
  qualification: QualificationData,
): PersonalisedCopy {
  const isFirstTime = investorType === 'first-time';
  const isPortfolioBuilder = investorType === 'portfolio-builder';
  const isReadySoon = qualification.investmentTimeline === 'immediately' || qualification.investmentTimeline === 'within-3-months';

  if (isFirstTime) {
    return {
      step1Subtitle: "Let's find the right first investment property for you",
      step2Subtitle: "We'll show you exactly what you can afford — and the tax benefits you're missing",
      resultsTitle: "Your First Investment Property Snapshot",
      resultsSubtitle: "Here's how your first investment property could perform",
      fearHeadline: "Every Year You Wait, You Fall Further Behind",
      fearSubheadline: "While you're thinking about it, property prices are climbing — and so is the cost of getting started",
      fearCtaText: "Make This a Reality",
      ctaHeadline: "Not Sure Where to Start? That's Exactly Why We're Here",
      ctaDescription: "In just 15 minutes, we'll review your numbers, explain what's realistic, and map out your first steps — no jargon, no pressure. Most first-time investors wish they'd had this conversation sooner.",
      ctaBadge: "Perfect for First-Time Investors",
      ctaButtonText: "Book My Free Clarity Call",
      testimonialQuote: "I was overwhelmed and didn't know where to start. The clarity call broke everything down in plain English. 6 months later, I'd settled on my first investment property — and it's already cash-flow positive.",
      testimonialName: "James M.",
      testimonialDetail: "Melbourne, VIC — First-time investor",
    };
  }

  if (isPortfolioBuilder) {
    return {
      step1Subtitle: "Analyse your next acquisition and optimise your portfolio",
      step2Subtitle: "We'll model the cash flow, tax impact, and how this fits your existing portfolio",
      resultsTitle: "Your Portfolio Expansion Snapshot",
      resultsSubtitle: "Here's how adding this property strengthens your portfolio",
      fearHeadline: "Your Portfolio Should Be Working Harder",
      fearSubheadline: "Every month without your next acquisition is compounding growth you'll never recover",
      fearCtaText: "Make This a Reality",
      ctaHeadline: "Ready to Scale Smarter?",
      ctaDescription: "In 15 minutes, we'll review how this property fits your portfolio, identify the optimal structure, and map out your next 2-3 acquisitions — with real numbers, not guesswork.",
      ctaBadge: "For Experienced Investors",
      ctaButtonText: "Book My Portfolio Strategy Call",
      testimonialQuote: "I already had two properties, but wasn't sure if my next move should be in the same state or diversify. The Smash team mapped out a 3-property plan that's added $180k in equity in 12 months.",
      testimonialName: "David L.",
      testimonialDetail: "Sydney, NSW — Portfolio of 4 properties",
    };
  }

  // Default / no type selected yet
  return {
    step1Subtitle: "Tell us about the investment property",
    step2Subtitle: "This helps us calculate your cash flow and tax benefits",
    resultsTitle: "Your Property Wealth Snapshot",
    resultsSubtitle: "Here's how your investment property could perform",
    fearHeadline: "The Cost of Doing Nothing",
    fearSubheadline: "What happens if you don't act on this",
    fearCtaText: "Make This a Reality",
    ctaHeadline: "Get Clarity on Your Next Move",
    ctaDescription: "In just 15 minutes, our team will review your results, answer your questions, and map out a clear path forward — no jargon, no pressure.",
    ctaBadge: "Free 15-Minute Call",
    ctaButtonText: "Book My Free Clarity Call",
    testimonialQuote: "The clarity call changed everything. Within 15 minutes I understood exactly where I stood and what my next steps were. 6 months later, I'd settled on my first investment property.",
    testimonialName: "James M.",
    testimonialDetail: "Melbourne, VIC — First-time investor",
  };
}

// --- Display Labels ---
export const EQUITY_RANGE_LABELS: Record<EquityRange, string> = {
  'under-50k': 'Under $50,000',
  '50k-100k': '$50,000 – $100,000',
  '100k-200k': '$100,000 – $200,000',
  '200k-500k': '$200,000 – $500,000',
  'over-500k': '$500,000+',
};

export const TIMELINE_LABELS: Record<InvestmentTimeline, string> = {
  'immediately': "I'm ready now",
  'within-3-months': 'Within 3 months',
  'within-6-months': 'Within 6 months',
  'within-12-months': 'Within 12 months',
  'just-exploring': 'Just exploring',
};

export const OWNERSHIP_LABELS: Record<PropertyOwnership, string> = {
  'own-home': 'I own my home',
  'own-investment': 'I own investment property',
  'renting': "I'm currently renting",
  'other': 'Other',
};
