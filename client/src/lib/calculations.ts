// ============================================
// SMASH PROPERTY INVESTMENT CALCULATOR ENGINE
// Australian property investment calculations
// ============================================

export interface PropertyInputs {
  propertyPrice: number;
  weeklyRent: number;
  suburb: string;
  state: string;
  propertyType: 'house' | 'unit' | 'townhouse';
}

export interface FinancialInputs {
  annualIncome: number;
  deposit: number;
  existingDebt: number;
  interestRate: number;
  loanTerm: number; // years
}

export interface CashFlowResult {
  grossRentalIncome: number;
  annualExpenses: {
    managementFees: number;
    insurance: number;
    maintenance: number;
    councilRates: number;
    waterRates: number;
    strataFees: number;
    landlordInsurance: number;
  };
  totalAnnualExpenses: number;
  loanRepaymentAnnual: number;
  loanRepaymentWeekly: number;
  weeklyCashFlow: number;
  annualCashFlow: number;
  grossYield: number;
  netYield: number;
  isPositivelyCashFlowed: boolean;
}

export interface TaxBenefitResult {
  depreciationYear1: number;
  negativeGearingDeduction: number;
  totalTaxDeduction: number;
  taxSavingAnnual: number;
  taxSavingWeekly: number;
  effectiveMarginalRate: number;
  afterTaxCashFlow: number;
  afterTaxWeeklyCashFlow: number;
}

export interface GrowthProjection {
  year: number;
  propertyValue: number;
  equity: number;
  loanBalance: number;
  cumulativeRentalIncome: number;
  cumulativeTaxSavings: number;
  totalWealthPosition: number;
}

export interface TenYearResult {
  projections: GrowthProjection[];
  growthRate: number;
  propertyValueYear10: number;
  equityYear10: number;
  totalRentalIncomeEarned: number;
  totalTaxSavingsEarned: number;
  totalWealthCreated: number;
  wealthIfNoInvestment: number;
  opportunityCost: number;
}

export interface CalculatorResults {
  cashFlow: CashFlowResult;
  taxBenefits: TaxBenefitResult;
  tenYear: TenYearResult;
  wealthScore: number; // 0-100 gamified metric
}

// Australian tax brackets 2025-26
function calculateTax(taxableIncome: number): number {
  if (taxableIncome <= 18200) return 0;
  if (taxableIncome <= 45000) return (taxableIncome - 18200) * 0.16;
  if (taxableIncome <= 135000) return 4288 + (taxableIncome - 45000) * 0.30;
  if (taxableIncome <= 190000) return 31288 + (taxableIncome - 135000) * 0.37;
  return 51638 + (taxableIncome - 190000) * 0.45;
}

function getMarginalRate(taxableIncome: number): number {
  if (taxableIncome <= 18200) return 0;
  if (taxableIncome <= 45000) return 0.16;
  if (taxableIncome <= 135000) return 0.30;
  if (taxableIncome <= 190000) return 0.37;
  return 0.45;
}

// Stamp duty by state (simplified — residential property)
export function calculateStampDuty(price: number, state: string): number {
  switch (state) {
    case 'VIC':
      if (price <= 25000) return price * 0.014;
      if (price <= 130000) return 350 + (price - 25000) * 0.024;
      if (price <= 960000) return 2870 + (price - 130000) * 0.06;
      return price * 0.055;
    case 'NSW':
      if (price <= 17000) return price * 0.0125;
      if (price <= 36000) return 212.5 + (price - 17000) * 0.015;
      if (price <= 97000) return 497.5 + (price - 36000) * 0.0175;
      if (price <= 364000) return 1565 + (price - 97000) * 0.035;
      if (price <= 3505000) return 10912 + (price - 364000) * 0.045;
      return price * 0.07;
    case 'QLD':
      if (price <= 5000) return 0;
      if (price <= 75000) return (price - 5000) * 0.015;
      if (price <= 540000) return 1050 + (price - 75000) * 0.035;
      if (price <= 1000000) return 17325 + (price - 540000) * 0.045;
      return 38025 + (price - 1000000) * 0.0575;
    case 'SA':
      if (price <= 12000) return price * 0.01;
      if (price <= 30000) return 120 + (price - 12000) * 0.02;
      if (price <= 50000) return 480 + (price - 30000) * 0.03;
      if (price <= 100000) return 1080 + (price - 50000) * 0.035;
      if (price <= 200000) return 2830 + (price - 100000) * 0.04;
      if (price <= 250000) return 6830 + (price - 200000) * 0.0425;
      if (price <= 300000) return 8955 + (price - 250000) * 0.0475;
      if (price <= 500000) return 11330 + (price - 300000) * 0.05;
      return 21330 + (price - 500000) * 0.055;
    case 'WA':
      if (price <= 120000) return price * 0.019;
      if (price <= 150000) return 2280 + (price - 120000) * 0.0285;
      if (price <= 360000) return 3135 + (price - 150000) * 0.038;
      if (price <= 725000) return 11115 + (price - 360000) * 0.0475;
      return 28453 + (price - 725000) * 0.0515;
    default:
      return price * 0.04; // Generic fallback
  }
}

// Loan amortization — monthly repayment (P&I)
function monthlyRepayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Remaining loan balance after X months
function remainingBalance(principal: number, annualRate: number, years: number, monthsPaid: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal * (1 - monthsPaid / n);
  const payment = monthlyRepayment(principal, annualRate, years);
  return principal * Math.pow(1 + r, monthsPaid) - payment * (Math.pow(1 + r, monthsPaid) - 1) / r;
}

// Growth rate based on state/type (conservative estimates)
function getGrowthRate(state: string, propertyType: string): number {
  const baseRates: Record<string, number> = {
    'VIC': 0.052,
    'NSW': 0.058,
    'QLD': 0.065,
    'SA': 0.055,
    'WA': 0.060,
    'TAS': 0.048,
    'NT': 0.035,
    'ACT': 0.050,
  };
  const base = baseRates[state] || 0.05;
  // Units historically grow slightly less
  if (propertyType === 'unit') return base * 0.85;
  if (propertyType === 'townhouse') return base * 0.92;
  return base;
}

// Depreciation estimate (Division 40 + Division 43)
function estimateDepreciation(price: number, propertyType: string, age: number = 5): number {
  // Simplified: newer properties get higher depreciation
  // Division 43 (building): 2.5% of construction cost (~60% of purchase for newer)
  const constructionRatio = propertyType === 'unit' ? 0.65 : 0.55;
  const buildingDepreciation = price * constructionRatio * 0.025;
  
  // Division 40 (plant & equipment): ~$3k-$8k year 1
  const plantDepreciation = propertyType === 'unit' 
    ? Math.min(price * 0.008, 6000)
    : Math.min(price * 0.006, 5000);
  
  return buildingDepreciation + plantDepreciation;
}

export function calculateAll(property: PropertyInputs, financial: FinancialInputs): CalculatorResults {
  const loanAmount = property.propertyPrice - financial.deposit;
  const monthlyPayment = monthlyRepayment(loanAmount, financial.interestRate / 100, financial.loanTerm);
  const annualRepayment = monthlyPayment * 12;
  const weeklyRepayment = annualRepayment / 52;
  
  // Interest portion (year 1 — roughly the whole payment is interest early on)
  const interestYear1 = loanAmount * (financial.interestRate / 100);

  // Annual rental income
  const grossRentalIncome = property.weeklyRent * 52;
  
  // Expenses
  const managementFees = grossRentalIncome * 0.08; // 8% management
  const insurance = Math.max(property.propertyPrice * 0.002, 1200); // ~0.2% or min $1200
  const maintenance = property.propertyPrice * 0.005; // 0.5%
  const councilRates = property.state === 'VIC' ? 2200 : property.state === 'NSW' ? 1800 : 1600;
  const waterRates = 1000;
  const strataFees = property.propertyType !== 'house' ? 3500 : 0;
  const landlordInsurance = 500;
  
  const totalAnnualExpenses = managementFees + insurance + maintenance + councilRates + waterRates + strataFees + landlordInsurance;
  
  // Cash flow
  const annualCashFlow = grossRentalIncome - totalAnnualExpenses - annualRepayment;
  const weeklyCashFlow = annualCashFlow / 52;
  
  const grossYield = (grossRentalIncome / property.propertyPrice) * 100;
  const netYield = ((grossRentalIncome - totalAnnualExpenses) / property.propertyPrice) * 100;

  const cashFlow: CashFlowResult = {
    grossRentalIncome,
    annualExpenses: {
      managementFees,
      insurance,
      maintenance,
      councilRates,
      waterRates,
      strataFees,
      landlordInsurance,
    },
    totalAnnualExpenses,
    loanRepaymentAnnual: annualRepayment,
    loanRepaymentWeekly: weeklyRepayment,
    weeklyCashFlow,
    annualCashFlow,
    grossYield,
    netYield,
    isPositivelyCashFlowed: annualCashFlow > 0,
  };

  // Tax benefits
  const depreciation = estimateDepreciation(property.propertyPrice, property.propertyType);
  const deductibleExpenses = totalAnnualExpenses + interestYear1 + depreciation;
  const negativeGearingLoss = Math.max(0, deductibleExpenses - grossRentalIncome);
  const marginalRate = getMarginalRate(financial.annualIncome);
  const taxSaving = negativeGearingLoss * marginalRate;
  
  const afterTaxCashFlow = annualCashFlow + taxSaving;

  const taxBenefits: TaxBenefitResult = {
    depreciationYear1: depreciation,
    negativeGearingDeduction: negativeGearingLoss,
    totalTaxDeduction: deductibleExpenses,
    taxSavingAnnual: taxSaving,
    taxSavingWeekly: taxSaving / 52,
    effectiveMarginalRate: marginalRate,
    afterTaxCashFlow,
    afterTaxWeeklyCashFlow: afterTaxCashFlow / 52,
  };

  // 10-year growth projection
  const growthRate = getGrowthRate(property.state, property.propertyType);
  const projections: GrowthProjection[] = [];
  let cumulativeRental = 0;
  let cumulativeTax = 0;
  
  for (let year = 0; year <= 10; year++) {
    const propertyValue = property.propertyPrice * Math.pow(1 + growthRate, year);
    const loanBalance = year === 0 
      ? loanAmount 
      : Math.max(0, remainingBalance(loanAmount, financial.interestRate / 100, financial.loanTerm, year * 12));
    const equity = propertyValue - loanBalance;
    
    if (year > 0) {
      // Rent grows ~3% per year
      const yearRent = grossRentalIncome * Math.pow(1.03, year - 1);
      cumulativeRental += yearRent;
      // Tax savings decline slightly as equity grows
      const yearTaxSaving = taxSaving * Math.pow(0.97, year - 1);
      cumulativeTax += yearTaxSaving;
    }
    
    projections.push({
      year,
      propertyValue: Math.round(propertyValue),
      equity: Math.round(equity),
      loanBalance: Math.round(loanBalance),
      cumulativeRentalIncome: Math.round(cumulativeRental),
      cumulativeTaxSavings: Math.round(cumulativeTax),
      totalWealthPosition: Math.round(equity + cumulativeRental + cumulativeTax),
    });
  }

  const year10 = projections[10];
  
  // "If you don't invest" comparison — just deposit earning 4% in HISA
  const wealthIfNoInvestment = financial.deposit * Math.pow(1.04, 10);
  
  const tenYear: TenYearResult = {
    projections,
    growthRate: growthRate * 100,
    propertyValueYear10: year10.propertyValue,
    equityYear10: year10.equity,
    totalRentalIncomeEarned: year10.cumulativeRentalIncome,
    totalTaxSavingsEarned: year10.cumulativeTaxSavings,
    totalWealthCreated: year10.totalWealthPosition,
    wealthIfNoInvestment: Math.round(wealthIfNoInvestment),
    opportunityCost: Math.round(year10.totalWealthPosition - wealthIfNoInvestment),
  };

  // Wealth Score (gamified 0-100)
  let score = 50; // baseline
  if (netYield > 4) score += 10;
  else if (netYield > 3) score += 5;
  if (afterTaxCashFlow > 0) score += 15;
  else if (afterTaxCashFlow > -2000) score += 8;
  if (growthRate > 0.055) score += 10;
  else if (growthRate > 0.045) score += 5;
  if (taxSaving > 8000) score += 10;
  else if (taxSaving > 4000) score += 5;
  if (financial.deposit / property.propertyPrice > 0.2) score += 5;
  score = Math.min(100, Math.max(0, score));

  return { cashFlow, taxBenefits, tenYear, wealthScore: score };
}

// Format currency (AUD)
export function formatCurrency(value: number, showCents: boolean = false): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = showCents 
    ? absValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : absValue.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `${isNegative ? '-' : ''}$${formatted}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
