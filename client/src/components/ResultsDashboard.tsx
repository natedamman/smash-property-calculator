import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, DollarSign, Percent, 
  BarChart3, Calendar, CheckCircle2, AlertTriangle,
  ArrowUpRight, Phone, Clock, XCircle, AlertOctagon,
  Timer, Users, ShieldCheck, Star
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import { 
  type CalculatorResults, type PropertyInputs, type FinancialInputs,
  formatCurrency, formatPercent 
} from "@/lib/calculations";

interface Props {
  results: CalculatorResults;
  propertyInputs: PropertyInputs;
  financialInputs: FinancialInputs;
}

function AnimatedNumber({ value, prefix = "", suffix = "", className = "", delay = 0 }: { 
  value: number; prefix?: string; suffix?: string; className?: string; delay?: number 
}) {
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const start = Date.now();
    const from = 0;
    const to = value;
    
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, started]);

  const formatted = Math.abs(displayed) >= 100 
    ? Math.round(displayed).toLocaleString('en-AU')
    : displayed.toFixed(1);

  return (
    <span className={className}>
      {value < 0 ? '-' : ''}{prefix}{value < 0 ? Math.abs(Number(formatted)).toLocaleString('en-AU') : formatted}{suffix}
    </span>
  );
}

function MetricCard({ label, value, prefix = "$", suffix = "", color = "text-foreground", subtext = "", delay = 0, icon: Icon }: {
  label: string; value: number; prefix?: string; suffix?: string; color?: string; subtext?: string; delay?: number; icon?: any;
}) {
  return (
    <Card className="p-5 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground/50" />}
      </div>
      <AnimatedNumber 
        value={value} 
        prefix={prefix} 
        suffix={suffix} 
        className={`text-2xl font-bold ${color}`}
        delay={delay}
      />
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </Card>
  );
}

/* Live social-proof ticker — simulates recent activity */
function SocialProofTicker() {
  const names = ["Sarah M.", "David L.", "Emma T.", "Michael K.", "Jessica R.", "Chris W.", "Amanda P.", "James H."];
  const states = ["VIC", "NSW", "QLD", "WA", "SA"];
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % names.length);
        setVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>{names[current]} from {states[current % states.length]} just got their snapshot</span>
    </div>
  );
}

export function ResultsDashboard({ results, propertyInputs, financialInputs }: Props) {
  const { cashFlow, taxBenefits, tenYear, wealthScore } = results;
  const ctaRef = useRef<HTMLDivElement>(null);

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Chart data
  const growthData = tenYear.projections.map(p => ({
    year: `Year ${p.year}`,
    'Property Value': p.propertyValue,
    'Loan Balance': p.loanBalance,
    'Equity': p.equity,
  }));

  const wealthData = tenYear.projections.slice(1).map(p => ({
    year: `Year ${p.year}`,
    'Equity': p.equity,
    'Rental Income': p.cumulativeRentalIncome,
    'Tax Savings': p.cumulativeTaxSavings,
  }));

  const cashFlowBreakdown = [
    { name: 'Rental Income', value: cashFlow.grossRentalIncome, fill: 'hsl(var(--chart-1))' },
    { name: 'Expenses', value: -cashFlow.totalAnnualExpenses, fill: 'hsl(var(--chart-4))' },
    { name: 'Loan Repayments', value: -cashFlow.loanRepaymentAnnual, fill: 'hsl(var(--chart-3))' },
    { name: 'Tax Savings', value: taxBenefits.taxSavingAnnual, fill: 'hsl(var(--chart-2))' },
  ];

  // Wealth score color
  const scoreColor = wealthScore >= 75 ? 'text-emerald-500' : wealthScore >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = wealthScore >= 75 ? 'bg-emerald-500/10' : wealthScore >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10';

  // Calculate cost of waiting (1 year of growth lost)
  const costOfWaiting1Year = propertyInputs.propertyPrice * (tenYear.growthRate / 100);

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="text-center mb-8">
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Report Unlocked
        </Badge>
        <h1 className="text-xl font-bold mb-2" data-testid="text-results-title">Your Property Wealth Snapshot</h1>
        <p className="text-sm text-muted-foreground">
          {propertyInputs.suburb ? `${propertyInputs.suburb}, ` : ''}{propertyInputs.state} &mdash; {formatCurrency(propertyInputs.propertyPrice)} {propertyInputs.propertyType}
        </p>
        {/* Live social proof */}
        <div className="mt-3 flex justify-center">
          <SocialProofTicker />
        </div>
      </div>

      {/* Wealth Score */}
      <Card className={`p-6 ${scoreBg} border-0`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1">Portfolio Wealth Score</p>
            <p className="text-xs text-muted-foreground">Based on yield, cash flow, growth potential, and tax efficiency</p>
          </div>
          <div className="text-right">
            <AnimatedNumber value={wealthScore} suffix="/100" className={`text-3xl font-bold ${scoreColor}`} />
          </div>
        </div>
        <div className="mt-4 h-2 bg-background/50 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out bg-primary"
            style={{ width: `${wealthScore}%` }}
          />
        </div>
      </Card>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard 
          label="Weekly Cash Flow" 
          value={cashFlow.weeklyCashFlow} 
          color={cashFlow.weeklyCashFlow >= 0 ? 'text-emerald-500' : 'text-amber-500'}
          subtext="Before tax benefits"
          icon={cashFlow.weeklyCashFlow >= 0 ? TrendingUp : TrendingDown}
          delay={100}
        />
        <MetricCard 
          label="Weekly Tax Saving" 
          value={taxBenefits.taxSavingWeekly} 
          color="text-primary"
          subtext={`At ${formatPercent(taxBenefits.effectiveMarginalRate * 100, 0)} marginal rate`}
          icon={DollarSign}
          delay={200}
        />
        <MetricCard 
          label="After-Tax Cash Flow" 
          value={taxBenefits.afterTaxWeeklyCashFlow} 
          suffix="/wk"
          prefix="$"
          color={taxBenefits.afterTaxWeeklyCashFlow >= 0 ? 'text-emerald-500' : 'text-amber-500'}
          subtext="Your true weekly position"
          icon={BarChart3}
          delay={300}
        />
        <MetricCard 
          label="Net Yield" 
          value={cashFlow.netYield} 
          prefix=""
          suffix="%"
          color="text-foreground"
          subtext={`Gross: ${formatPercent(cashFlow.grossYield)}`}
          icon={Percent}
          delay={400}
        />
      </div>

      {/* Tabbed detailed results */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="growth" data-testid="tab-growth">10-Year Growth</TabsTrigger>
          <TabsTrigger value="cashflow" data-testid="tab-cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="tax" data-testid="tab-tax">Tax Benefits</TabsTrigger>
        </TabsList>

        {/* 10-Year Growth Tab */}
        <TabsContent value="growth" className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">Property Value vs Equity Over 10 Years</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="Property Value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Equity" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Loan Balance" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.08)" strokeWidth={1.5} strokeDasharray="4 4" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              label="Property Value (Year 10)" 
              value={tenYear.propertyValueYear10} 
              subtext={`${formatPercent(tenYear.growthRate)} p.a. growth`}
              delay={0}
            />
            <MetricCard 
              label="Equity Position (Year 10)" 
              value={tenYear.equityYear10} 
              color="text-primary"
              delay={100}
            />
          </div>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">Annual Cash Flow Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Rental Income</span>
                <span className="text-sm font-medium text-emerald-500">+{formatCurrency(cashFlow.grossRentalIncome)}</span>
              </div>
              <div className="space-y-2 py-2 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Expenses</span>
                  <span className="text-sm font-medium text-red-400">-{formatCurrency(cashFlow.totalAnnualExpenses)}</span>
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Management fees (8%)</span>
                    <span>{formatCurrency(cashFlow.annualExpenses.managementFees)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Insurance</span>
                    <span>{formatCurrency(cashFlow.annualExpenses.insurance)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Maintenance</span>
                    <span>{formatCurrency(cashFlow.annualExpenses.maintenance)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Council rates</span>
                    <span>{formatCurrency(cashFlow.annualExpenses.councilRates)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Water rates</span>
                    <span>{formatCurrency(cashFlow.annualExpenses.waterRates)}</span>
                  </div>
                  {cashFlow.annualExpenses.strataFees > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Strata/body corp</span>
                      <span>{formatCurrency(cashFlow.annualExpenses.strataFees)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Landlord insurance</span>
                    <span>{formatCurrency(cashFlow.annualExpenses.landlordInsurance)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Loan Repayments (P&I)</span>
                <span className="text-sm font-medium text-red-400">-{formatCurrency(cashFlow.loanRepaymentAnnual)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm font-semibold">Pre-Tax Cash Flow</span>
                <span className={`text-sm font-bold ${cashFlow.annualCashFlow >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {formatCurrency(cashFlow.annualCashFlow)}/yr ({formatCurrency(cashFlow.weeklyCashFlow)}/wk)
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">+ Tax Savings</span>
                <span className="text-sm font-medium text-primary">+{formatCurrency(taxBenefits.taxSavingAnnual)}</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-primary/5 rounded-lg px-3 -mx-1">
                <span className="text-sm font-bold">After-Tax Cash Flow</span>
                <span className={`text-base font-bold ${taxBenefits.afterTaxCashFlow >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {formatCurrency(taxBenefits.afterTaxCashFlow)}/yr ({formatCurrency(taxBenefits.afterTaxWeeklyCashFlow)}/wk)
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tax Benefits Tab */}
        <TabsContent value="tax" className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">Tax Deductions (Year 1)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Investment property expenses</span>
                <span className="text-sm font-medium">{formatCurrency(cashFlow.totalAnnualExpenses)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Loan interest (Year 1)</span>
                <span className="text-sm font-medium">{formatCurrency((propertyInputs.propertyPrice - financialInputs.deposit) * (financialInputs.interestRate / 100))}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <span className="text-sm text-muted-foreground">Depreciation (Div 40 + 43)</span>
                  <p className="text-xs text-muted-foreground">Requires a quantity surveyor report</p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(taxBenefits.depreciationYear1)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm font-semibold">Total Deductions</span>
                <span className="text-sm font-bold">{formatCurrency(taxBenefits.totalTaxDeduction)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Less: Rental Income</span>
                <span className="text-sm font-medium">-{formatCurrency(cashFlow.grossRentalIncome)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm font-semibold">Negative Gearing Loss</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(taxBenefits.negativeGearingDeduction)}</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-primary/5 rounded-lg px-3 -mx-1">
                <div>
                  <span className="text-sm font-bold">Annual Tax Saving</span>
                  <p className="text-xs text-muted-foreground">At {formatPercent(taxBenefits.effectiveMarginalRate * 100, 0)} marginal tax rate</p>
                </div>
                <span className="text-lg font-bold text-primary">{formatCurrency(taxBenefits.taxSavingAnnual)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-2">What This Means</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The ATO effectively subsidises your investment by {formatCurrency(taxBenefits.taxSavingWeekly)} per week 
              ({formatCurrency(taxBenefits.taxSavingAnnual)} annually). Combined with rental income, your after-tax 
              holding cost is just {formatCurrency(Math.abs(taxBenefits.afterTaxWeeklyCashFlow))} per week
              {taxBenefits.afterTaxCashFlow >= 0 ? ' — and you\'re actually cash flow positive.' : '.'}
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================ */}
      {/* FEAR SECTION — "If You Don't Invest" */}
      {/* ============================================ */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-950/20 via-red-900/10 to-background dark:from-red-950/40 dark:via-red-900/20">
        {/* Subtle animated pulse border effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-red-500/20 animate-pulse pointer-events-none" />
        
        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-red-500 dark:text-red-400">
                The Cost of Doing Nothing
              </h3>
              <p className="text-sm text-muted-foreground">What happens if you don't act on this</p>
            </div>
          </div>

          {/* Main fear stat */}
          <div className="bg-red-500/10 rounded-xl p-5 mb-5 border border-red-500/20">
            <p className="text-sm text-muted-foreground mb-2">If you leave your {formatCurrency(financialInputs.deposit)} in a savings account at 4% p.a. for 10 years:</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm text-muted-foreground">You'd have:</span>
              <span className="text-2xl font-bold text-red-400">{formatCurrency(tenYear.wealthIfNoInvestment)}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">With property, you'd have:</span>
              <span className="text-2xl font-bold text-emerald-500">{formatCurrency(tenYear.equityYear10 + tenYear.projections[tenYear.projections.length - 1]?.cumulativeRentalIncome + tenYear.projections[tenYear.projections.length - 1]?.cumulativeTaxSavings)}</span>
            </div>
          </div>

          {/* Opportunity cost callout */}
          <div className="flex items-center gap-3 bg-background/60 rounded-xl p-4 mb-5 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">
                You'd miss out on {formatCurrency(tenYear.opportunityCost)} in wealth
              </p>
              <p className="text-xs text-muted-foreground">
                That's {formatCurrency(tenYear.opportunityCost / 10 / 52)} per week you're leaving on the table by waiting
              </p>
            </div>
          </div>

          {/* Fear bullets */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Timer className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Every year you wait costs you ~{formatCurrency(costOfWaiting1Year)}</span> in missed property growth alone
              </p>
            </div>
            <div className="flex items-start gap-3">
              <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Inflation eats your savings</span> — your {formatCurrency(financialInputs.deposit)} will have less buying power next year
              </p>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">You're missing {formatCurrency(taxBenefits.taxSavingAnnual)}/yr in tax deductions</span> — money the ATO gives back to investors, not savers
              </p>
            </div>
          </div>

          {/* Urgency CTA inside fear section */}
          <Button 
            onClick={scrollToCTA}
            variant="destructive" 
            size="lg" 
            className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700 text-white"
            data-testid="button-fear-cta"
          >
            <Phone className="w-4 h-4 mr-2" />
            Don't Wait — Book Your Free Clarity Call
          </Button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MID-PAGE CTA — Urgency/Scarcity Strip */}
      {/* ============================================ */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">Limited availability</span>
            <span className="text-muted-foreground">— Only 5 clarity call spots left this week</span>
          </div>
          <Button 
            onClick={scrollToCTA}
            variant="outline" 
            size="sm" 
            className="border-primary/30 text-primary hover:bg-primary/10 whitespace-nowrap"
          >
            Claim Your Spot
          </Button>
        </div>
      </Card>

      {/* ============================================ */}
      {/* SOCIAL PROOF SECTION */}
      {/* ============================================ */}
      <Card className="p-5 border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <Star className="w-4 h-4 text-primary fill-primary" />
          <Star className="w-4 h-4 text-primary fill-primary" />
          <Star className="w-4 h-4 text-primary fill-primary" />
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs text-muted-foreground ml-1">From 200+ investors</span>
        </div>
        <p className="text-sm italic text-muted-foreground leading-relaxed mb-3">
          "The clarity call changed everything. Within 15 minutes I understood exactly where I stood and what my next steps were. 6 months later, I'd settled on my first investment property."
        </p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">JM</span>
          </div>
          <div>
            <p className="text-xs font-medium">James M.</p>
            <p className="text-xs text-muted-foreground">Melbourne, VIC — First-time investor</p>
          </div>
        </div>
      </Card>

      {/* ============================================ */}
      {/* MAIN CTA SECTION — Book Clarity Call */}
      {/* ============================================ */}
      <div ref={ctaRef}>
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative text-center">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              <Clock className="w-3 h-3 mr-1" />
              Free 15-Minute Call
            </Badge>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Get Clarity on Your Next Move</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              In just 15 minutes, our team will review your results, answer your questions, and map out a clear path forward — no jargon, no pressure.
            </p>
            
            {/* What you'll get */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left max-w-lg mx-auto">
              <div className="flex items-start gap-2 bg-background/60 rounded-lg p-3 border border-border/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">Personalised review of your numbers</span>
              </div>
              <div className="flex items-start gap-2 bg-background/60 rounded-lg p-3 border border-border/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">Actionable next steps for your situation</span>
              </div>
              <div className="flex items-start gap-2 bg-background/60 rounded-lg p-3 border border-border/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">No obligation, no sales pitch</span>
              </div>
            </div>

            <Button size="lg" className="h-14 px-10 text-base font-semibold animate-pulse-glow" data-testid="button-book-session">
              <Phone className="w-5 h-5 mr-2" />
              Book My Free Clarity Call
            </Button>
            
            {/* Trust signals under CTA */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% free</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Just 15 minutes</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>2,847+ investors helped</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
