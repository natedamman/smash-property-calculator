import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { type PropertyInputs, type FinancialInputs, formatCurrency } from "@/lib/calculations";
import {
  type QualificationData,
  type InvestorType,
  type WealthGoal,
  type LeadScore,
  EQUITY_RANGE_LABELS,
  TIMELINE_LABELS,
  OWNERSHIP_LABELS,
  WEALTH_GOAL_CRM_VALUES,
} from "@/lib/lead-scoring";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyInputs: PropertyInputs;
  financialInputs: FinancialInputs;
  qualification: QualificationData;
  investorType: InvestorType | null;
  leadScore: LeadScore | null;
  wealthGoal: WealthGoal | null;
}

export function LeadCaptureModal({
  open,
  onClose,
  onSuccess,
  propertyInputs,
  financialInputs,
  qualification,
  investorType,
  leadScore,
  wealthGoal,
}: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = firstName.trim() && email.trim() && email.includes("@") && consent;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError("");


    
    try {
      // HubSpot Forms API v3
      // Replace PORTAL_ID and FORM_ID with actual HubSpot values
      const PORTAL_ID = "46147239";
      const FORM_ID = "ae9af09d-c7cf-4fec-9031-847128baa58e";

      // Standard HubSpot contact fields (these always exist)
      const fields: { objectTypeId: string; name: string; value: string }[] = [
        { objectTypeId: "0-1", name: "firstname", value: firstName },
        { objectTypeId: "0-1", name: "lastname", value: lastName },
        { objectTypeId: "0-1", name: "email", value: email },
        { objectTypeId: "0-1", name: "phone", value: phone },
      ];

      // Custom property fields — these only work if the matching custom properties
      // have been created in HubSpot. We send them separately so a failure doesn't
      // block the core contact creation.
      const customFields: { name: string; value: string }[] = [
        { name: "property_price", value: propertyInputs.propertyPrice.toString() },
        { name: "weekly_rent", value: propertyInputs.weeklyRent.toString() },
        { name: "property_state", value: propertyInputs.displayState === 'OPEN' ? 'Open to best opportunities' : propertyInputs.state },
        { name: "primary_wealth_goal", value: wealthGoal ? WEALTH_GOAL_CRM_VALUES[wealthGoal] : "" },
        { name: "annual_income", value: financialInputs.annualIncome.toString() },
        { name: "deposit_amount", value: financialInputs.deposit.toString() },
        { name: "interest_rate", value: financialInputs.interestRate.toString() },
        { name: "lead_source", value: "Property Wealth Calculator" },
        { name: "investor_type", value: investorType ?? "" },
        { name: "property_ownership_status", value: qualification.propertyOwnership ? OWNERSHIP_LABELS[qualification.propertyOwnership] : "" },
        { name: "usable_equity_range", value: qualification.equityRange ? EQUITY_RANGE_LABELS[qualification.equityRange] : "" },
        { name: "investment_timeline", value: qualification.investmentTimeline ? TIMELINE_LABELS[qualification.investmentTimeline] : "" },
        { name: "lead_temperature", value: leadScore?.temperature ?? "" },
        { name: "lead_score", value: leadScore?.score?.toString() ?? "" },
        { name: "lead_score_reasons", value: leadScore?.reasons?.join("; ") ?? "" },
      ];

      // Build a summary message for the HubSpot "message" field as a fallback
      // so all data is captured even without custom properties
      const locationLabel = propertyInputs.displayState === 'OPEN' ? 'Open to best opportunities' : propertyInputs.state;
      const messageSummary = [
        `Wealth Goal: ${wealthGoal ? WEALTH_GOAL_CRM_VALUES[wealthGoal] : 'Not selected'}`,
        `Investment Budget: $${propertyInputs.propertyPrice.toLocaleString()}`,
        `Location: ${locationLabel}`,
        `Weekly Rent (est.): $${propertyInputs.weeklyRent}`,
        `Annual Income: $${financialInputs.annualIncome.toLocaleString()}`,
        `Deposit: $${financialInputs.deposit.toLocaleString()}`,
        `Interest Rate: ${financialInputs.interestRate}%`,
        `Investor Type: ${investorType ?? 'N/A'}`,
        `Ownership: ${qualification.propertyOwnership ? OWNERSHIP_LABELS[qualification.propertyOwnership] : 'N/A'}`,
        `Equity Range: ${qualification.equityRange ? EQUITY_RANGE_LABELS[qualification.equityRange] : 'N/A'}`,
        `Timeline: ${qualification.investmentTimeline ? TIMELINE_LABELS[qualification.investmentTimeline] : 'N/A'}`,
        `Lead Score: ${leadScore?.score ?? 'N/A'}/100 (${leadScore?.temperature ?? 'N/A'})`,
      ].join('\n');

      // Merge standard + custom fields for the submission
      const allFields = [
        ...fields,
        ...customFields.map(f => ({ objectTypeId: "0-1", ...f })),
        { objectTypeId: "0-1", name: "message", value: messageSummary },
      ];

      const hubspotData = {
        submittedAt: Date.now().toString(),
        fields: allFields,
        context: {
          pageUri: window.location.href,
          pageName: "Property Wealth Snapshot Calculator",
        },
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: "I agree to receive my Property Wealth Snapshot report and occasional property investment insights from Smash Property.",
          },
        },
      };

      const submitUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;
      const headers = { "Content-Type": "application/json" };

      // Try with all fields first
      let response = await fetch(submitUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(hubspotData),
      });

      // If it fails (likely custom fields don't exist yet), retry with just
      // standard fields + message summary so the lead is never lost
      if (!response.ok) {
        console.warn("HubSpot full submission failed, retrying with standard fields only:", await response.text());
        const fallbackData = {
          submittedAt: Date.now().toString(),
          fields: [
            ...fields,
            { objectTypeId: "0-1", name: "message", value: messageSummary },
          ],
          context: hubspotData.context,
        };
        response = await fetch(submitUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(fallbackData),
        });
        if (!response.ok) {
          console.warn("HubSpot fallback submission also failed:", await response.text());
        }
      }

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 800));
      onSuccess();
    } catch (err) {
      console.error("Lead capture error:", err);
      // Still let them through even if HubSpot fails
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Unlock Your Full Report</DialogTitle>
          <DialogDescription className="text-sm">
            Enter your details to get your complete Property Wealth Snapshot with
            detailed projections, tax analysis, and access to a free 15-minute
            clarity call.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm">
                First Name
              </Label>
              <Input
                id="firstName"
                data-testid="input-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm">
                Last Name
              </Label>
              <Input
                id="lastName"
                data-testid="input-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">
              Phone (optional)
            </Label>
            <Input
              id="phone"
              data-testid="input-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="04XX XXX XXX"
              className="h-11"
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent"
              data-testid="checkbox-consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="consent"
              className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to receive my Property Wealth Snapshot report and
              occasional property investment insights from Smash Property. You
              can unsubscribe at any time.
            </label>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            data-testid="button-submit-lead"
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Get My Full Report
              </>
            )}
          </Button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Privacy protected</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>No spam</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
