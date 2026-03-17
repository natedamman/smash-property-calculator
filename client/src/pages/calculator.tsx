import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Building2, DollarSign, TrendingUp, Lock, ArrowRight, ArrowLeft, 
  CheckCircle2, Info, Home, Wallet, BarChart3, Calculator,
  Shield, ChevronRight, Sparkles, Users
} from "lucide-react";
import { 
  calculateAll, formatCurrency, formatPercent, calculateStampDuty,
  type PropertyInputs, type FinancialInputs, type CalculatorResults 
} from "@/lib/calculations";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import { SmashLogo } from "@/components/SmashLogo";

const STATES = [
  { value: 'VIC', label: 'Victoria' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'ACT' },
];

const PROPERTY_TYPES = [
  { value: 'house', label: 'House', icon: Home },
  { value: 'unit', label: 'Unit / Apartment', icon: Building2 },
  { value: 'townhouse', label: 'Townhouse', icon: Building2 },
];

type Step = 1 | 2 | 3 | 4 | 5;

export default function CalculatorPage() {
  const [step, setStep] = useState<Step>(1);
  const [showModal, setShowModal] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Property inputs
  const [propertyPrice, setPropertyPrice] = useState<string>("650000");
  const [weeklyRent, setWeeklyRent] = useState<string>("500");
  const [suburb, setSuburb] = useState<string>("");
  const [state, setState] = useState<string>("VIC");
  const [propertyType, setPropertyType] = useState<string>("house");
  
  // Financial inputs
  const [annualIncome, setAnnualIncome] = useState<string>("120000");
  const [deposit, setDeposit] = useState<string>("130000");
  const [existingDebt, setExistingDebt] = useState<string>("0");
  const [interestRate, setInterestRate] = useState<number[]>([6.2]);
  const [loanTerm, setLoanTerm] = useState<number[]>([30]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const propertyInputs: PropertyInputs = {
    propertyPrice: Number(propertyPrice) || 0,
    weeklyRent: Number(weeklyRent) || 0,
    suburb,
    state,
    propertyType: propertyType as 'house' | 'unit' | 'townhouse',
  };

  const financialInputs: FinancialInputs = {
    annualIncome: Number(annualIncome) || 0,
    deposit: Number(deposit) || 0,
    existingDebt: Number(existingDebt) || 0,
    interestRate: interestRate[0],
    loanTerm: loanTerm[0],
  };

  const computeResults = () => {
    const r = calculateAll(propertyInputs, financialInputs);
    setResults(r);
    return r;
  };

  const handleNext = () => {
    if (step === 2) {
      computeResults();
      setStep(3);
    } else if (step === 3) {
      setShowModal(true);
    } else if (step < 5) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleLeadCaptured = () => {
    setLeadCaptured(true);
    setShowModal(false);
    setStep(5);
  };

  const stampDuty = calculateStampDuty(Number(propertyPrice) || 0, state);
  const loanAmount = (Number(propertyPrice) || 0) - (Number(deposit) || 0);

  const isStep1Valid = Number(propertyPrice) > 0 && Number(weeklyRent) > 0 && state;
  const isStep2Valid = Number(annualIncome) > 0 && Number(deposit) > 0 && loanAmount > 0;

  const progressPercent = step === 1 ? 20 : step === 2 ? 45 : step === 3 ? 70 : step === 4 ? 85 : 100;

  return (
    <div className="min-h-screen bg-background" ref={contentRef}>
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <SmashLogo />
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs font-medium hidden sm:flex">
              <Users className="w-3 h-3 mr-1" />
              2,847+ investors helped
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-card/50 border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Step {Math.min(step, 3)} of 3
            </span>
            <span className="text-xs text-muted-foreground">
              {step <= 2 ? "Calculating your snapshot..." : step === 3 ? "Results ready" : step === 5 ? "Complete" : "Almost there"}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full progress-gradient rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Step 1: Property Details */}
        {step === 1 && (
          <div className="step-enter">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold" data-testid="text-step1-title">Property Details</h1>
                  <p className="text-sm text-muted-foreground">Tell us about the investment property</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Property Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setPropertyType(type.value)}
                      data-testid={`button-property-type-${type.value}`}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                        propertyType === type.value 
                          ? 'border-primary bg-primary/5 text-foreground' 
                          : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 mx-auto mb-2 ${propertyType === type.value ? 'text-primary' : ''}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger data-testid="select-state" className="h-12">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Suburb */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Suburb (optional)</Label>
                <Input 
                  data-testid="input-suburb"
                  value={suburb} 
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="e.g. Richmond, Parramatta"
                  className="h-12"
                />
              </div>

              {/* Property Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Purchase Price</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">The expected purchase price of the investment property</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    data-testid="input-property-price"
                    type="text"
                    inputMode="numeric"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    className="pl-9 h-12 text-lg font-medium"
                  />
                </div>
                {Number(propertyPrice) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Stamp duty ({state}): {formatCurrency(stampDuty)}
                  </p>
                )}
              </div>

              {/* Weekly Rent */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Expected Weekly Rent</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">Estimated weekly rental income. Check realestate.com.au for comparable rents</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    data-testid="input-weekly-rent"
                    type="text"
                    inputMode="numeric"
                    value={weeklyRent}
                    onChange={(e) => setWeeklyRent(e.target.value.replace(/[^0-9]/g, ''))}
                    className="pl-9 h-12 text-lg font-medium"
                  />
                </div>
                {Number(propertyPrice) > 0 && Number(weeklyRent) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Gross yield: {formatPercent((Number(weeklyRent) * 52 / Number(propertyPrice)) * 100)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button 
                onClick={handleNext} 
                disabled={!isStep1Valid}
                data-testid="button-next-step1"
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Next: Your Financial Position
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Takes under 60 seconds. Your results are calculated instantly.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Financial Position */}
        {step === 2 && (
          <div className="step-enter">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold" data-testid="text-step2-title">Your Financial Position</h1>
                  <p className="text-sm text-muted-foreground">This helps us calculate your cash flow and tax benefits</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Annual Income */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Annual Income (before tax)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">Your total annual salary or business income before tax</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    data-testid="input-annual-income"
                    type="text"
                    inputMode="numeric"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value.replace(/[^0-9]/g, ''))}
                    className="pl-9 h-12 text-lg font-medium"
                  />
                </div>
              </div>

              {/* Deposit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Available Deposit</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">Cash available for the deposit (including equity in existing property)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    data-testid="input-deposit"
                    type="text"
                    inputMode="numeric"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value.replace(/[^0-9]/g, ''))}
                    className="pl-9 h-12 text-lg font-medium"
                  />
                </div>
                {Number(propertyPrice) > 0 && Number(deposit) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    LVR: {formatPercent(((Number(propertyPrice) - Number(deposit)) / Number(propertyPrice)) * 100)} 
                    {' '}| Loan amount: {formatCurrency(loanAmount)}
                  </p>
                )}
              </div>

              {/* Existing Debt */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Existing Debt (excl. home loan)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    data-testid="input-existing-debt"
                    type="text"
                    inputMode="numeric"
                    value={existingDebt}
                    onChange={(e) => setExistingDebt(e.target.value.replace(/[^0-9]/g, ''))}
                    className="pl-9 h-12"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Interest Rate</Label>
                  <span className="text-sm font-semibold text-primary">{interestRate[0].toFixed(1)}%</span>
                </div>
                <Slider
                  data-testid="slider-interest-rate"
                  value={interestRate}
                  onValueChange={setInterestRate}
                  min={3}
                  max={9}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3.0%</span>
                  <span>9.0%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Loan Term</Label>
                  <span className="text-sm font-semibold text-primary">{loanTerm[0]} years</span>
                </div>
                <Slider
                  data-testid="slider-loan-term"
                  value={loanTerm}
                  onValueChange={setLoanTerm}
                  min={10}
                  max={30}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10 years</span>
                  <span>30 years</span>
                </div>
              </div>
            </div>

            {/* Quick summary card */}
            <Card className="mt-6 p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Quick Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Loan Amount</p>
                  <p className="font-semibold">{formatCurrency(Math.max(0, loanAmount))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Est. Monthly Repayment</p>
                  <p className="font-semibold">
                    {loanAmount > 0 
                      ? formatCurrency(loanAmount * (interestRate[0] / 100 / 12) * Math.pow(1 + interestRate[0] / 100 / 12, loanTerm[0] * 12) / (Math.pow(1 + interestRate[0] / 100 / 12, loanTerm[0] * 12) - 1))
                      : '$0'
                    }
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-8 flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                data-testid="button-back-step2"
                className="h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!isStep2Valid}
                data-testid="button-next-step2"
                className="flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                Calculate My Snapshot
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Join 2,847+ Australians who've already discovered their property potential
            </p>
          </div>
        )}

        {/* Step 3: Teaser Results (blurred/locked) */}
        {step === 3 && results && (
          <div className="step-enter">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold" data-testid="text-step3-title">Your Property Wealth Snapshot</h1>
                  <p className="text-sm text-muted-foreground">Here's a preview of your personalised results</p>
                </div>
              </div>
            </div>

            {/* Visible teaser metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Card className="p-5">
                <p className="text-xs text-muted-foreground mb-1">Gross Rental Yield</p>
                <p className="text-2xl font-bold text-primary animate-count-up" data-testid="text-gross-yield">
                  {formatPercent(results.cashFlow.grossYield)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Annual rental return on purchase price</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-muted-foreground mb-1">Weekly Cash Flow</p>
                <p className={`text-2xl font-bold animate-count-up ${results.cashFlow.weeklyCashFlow >= 0 ? 'text-emerald-500' : 'text-amber-500'}`} data-testid="text-weekly-cashflow">
                  {formatCurrency(results.cashFlow.weeklyCashFlow)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Before tax benefits</p>
              </Card>
            </div>

            {/* Blurred/locked metrics */}
            <div className="relative mb-6">
              <div className="blur-overlay space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Weekly Tax Saving</p>
                    <p className="text-2xl font-bold text-primary">$187</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">After-Tax Cash Flow</p>
                    <p className="text-2xl font-bold text-emerald-500">+$45/wk</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">10-Year Equity</p>
                    <p className="text-2xl font-bold">$482,000</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Wealth Score</p>
                    <p className="text-2xl font-bold text-primary">78/100</p>
                  </Card>
                </div>
                <Card className="p-5 h-48 bg-muted/20" />
              </div>
              
              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Unlock Your Full Report</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-5 px-4">
                  Get your complete Property Wealth Snapshot with detailed projections, tax analysis, and a personalised PDF report
                </p>
                <Button 
                  onClick={handleNext}
                  data-testid="button-unlock-results"
                  size="lg" 
                  className="h-12 px-8 text-base font-semibold animate-pulse-glow"
                >
                  Unlock My Results
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>ASIC compliant</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                <span>Your data is secure</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>2,847+ investors helped</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                data-testid="button-back-step3"
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to edit inputs
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Full Results Dashboard */}
        {step === 5 && results && leadCaptured && (
          <div className="step-enter">
            <ResultsDashboard 
              results={results} 
              propertyInputs={propertyInputs}
              financialInputs={financialInputs}
            />
          </div>
        )}
      </main>

      {/* Lead capture modal */}
      <LeadCaptureModal 
        open={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={handleLeadCaptured}
        propertyInputs={propertyInputs}
        financialInputs={financialInputs}
      />

      {/* Footer disclaimer */}
      <footer className="border-t border-border/50 bg-card/30 mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>General Advice Warning:</strong> The information provided by this calculator is general in nature and does not constitute personal financial advice. Results are estimates for illustrative purposes only and should not be relied upon for making investment decisions. We recommend seeking advice from a qualified financial adviser before proceeding with any property investment. Smash Property is not a licensed financial adviser.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Smash Property. All rights reserved.
            </p>
            <a 
              href="https://www.smashproperty.com.au/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              smashproperty.com.au
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
