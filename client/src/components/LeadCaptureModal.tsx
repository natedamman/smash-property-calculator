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

    const HUBSPOT_CONFIG = {
  portalId: '46147239',
  formId: 'ae9af09d-c7cf-4fec-9031-847128baa58e'
};
    
    try {
      // HubSpot Forms API v3
      // Replace PORTAL_ID and FORM_ID with actual HubSpot values
      const PORTAL_ID = "46147239";
      const FORM_ID = "ae9af09d-c7cf-4fec-9031-847128baa58e";

      // Build enriched fields array
      const fields = [
        // Standard contact fields
        { objectTypeId: "0-1", name: "firstname", value: firstName },
        { objectTypeId: "0-1", name: "lastname", value: lastName },
        { objectTypeId: "0-1", name: "email", value: email },
        { objectTypeId: "0-1", name: "phone", value: phone },
        // Property details
        { objectTypeId: "0-1", name: "property_price", value: propertyInputs.propertyPrice.toString() },
        { objectTypeId: "0-1", name: "weekly_rent", value: propertyInputs.weeklyRent.toString() },
        { objectTypeId: "0-1", name: "property_state", value: propertyInputs.displayState === 'OPEN' ? 'Open to best opportunities' : propertyInputs.state },
        { objectTypeId: "0-1", name: "primary_wealth_goal", value: wealthGoal ? WEALTH_GOAL_CRM_VALUES[wealthGoal] : "" },
        // Financial details
        { objectTypeId: "0-1", name: "annual_income", value: financialInputs.annualIncome.toString() },
        { objectTypeId: "0-1", name: "deposit_amount", value: financialInputs.deposit.toString() },
        { objectTypeId: "0-1", name: "interest_rate", value: financialInputs.interestRate.toString() },
        // Lead source
        { objectTypeId: "0-1", name: "lead_source", value: "Property Wealth Calculator" },
        // Qualification & segmentation fields
        { objectTypeId: "0-1", name: "investor_type", value: investorType ?? "" },
        {
          objectTypeId: "0-1",
          name: "property_ownership_status",
          value: qualification.propertyOwnership
            ? OWNERSHIP_LABELS[qualification.propertyOwnership]
            : "",
        },
        {
          objectTypeId: "0-1",
          name: "usable_equity_range",
          value: qualification.equityRange
            ? EQUITY_RANGE_LABELS[qualification.equityRange]
            : "",
        },
        {
          objectTypeId: "0-1",
          name: "investment_timeline",
          value: qualification.investmentTimeline
            ? TIMELINE_LABELS[qualification.investmentTimeline]
            : "",
        },
        // Lead scoring fields
        {
          objectTypeId: "0-1",
          name: "lead_temperature",
          value: leadScore?.temperature ?? "",
        },
        {
          objectTypeId: "0-1",
          name: "lead_score",
          value: leadScore?.score?.toString() ?? "",
        },
        {
          objectTypeId: "0-1",
          name: "lead_score_reasons",
          value: leadScore?.reasons?.join("; ") ?? "",
        },
      ];

      const hubspotData = {
        submittedAt: Date.now().toString(),
        fields,
        context: {
          pageUri: window.location.href,
          pageName: "Property Wealth Snapshot Calculator",
        },
      };

      // If HubSpot IDs aren't configured, skip the API call but still capture
      if (PORTAL_ID !== "YOUR_HUBSPOT_PORTAL_ID" && FORM_ID !== "YOUR_HUBSPOT_FORM_ID") {
        const response = await fetch(
          `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(hubspotData),
          }
        );
        if (!response.ok) {
          console.warn("HubSpot submission failed:", await response.text());
        }
      } else {
        // Log the lead data for debugging / manual capture
        console.log("Lead captured (HubSpot not configured):", {
          firstName,
          lastName,
          email,
          phone,
          property: propertyInputs,
          financial: financialInputs,
          qualification,
          investorType,
          leadScore,
        });
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
