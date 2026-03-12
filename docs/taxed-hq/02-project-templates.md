# Taxed HQ Project Templates

This file defines the first three user-facing project templates and the required data contract for each.

## Shared Template Schema
- **Template ID**
- **Template Name**
- **Use Case**
- **Inputs (required/optional)**
- **Outputs**
- **Compare Modes**
- **Action Checklist**
- **Confidence Prompt**

---

## Template 1: My Baseline W-2 Year
- **Template ID:** `baseline_w2_year`
- **Use case:** Build a current-state tax snapshot from one primary job.

### Required Inputs
- Filing status
- State
- Gross annual salary
- Pay frequency
- Federal withholding method (current estimate)

### Optional Inputs
- Pre-tax contributions (401k, HSA)
- Dependents
- Additional withholding
- Other income (interest/dividends, small side income)

### Outputs
- Estimated federal + state tax
- Effective tax rate
- Monthly take-home estimate
- Refund/owed risk band
- Top 3 leverage points (e.g., withholding, pre-tax contributions)

### Compare Modes
- Baseline vs \"Adjusted withholding\"
- Baseline vs \"Increased retirement contribution\"

### Action Checklist
1. Confirm filing status and dependents.
2. Validate current withholding against modeled result.
3. Select one optimization action for next paycheck cycle.

### Confidence Prompt
\"How confident are you explaining your effective rate in one sentence?\"

---

## Template 2: Raise vs Bonus
- **Template ID:** `raise_vs_bonus`
- **Use case:** Compare annual take-home impact between compensation structures.

### Required Inputs
- Current salary
- Proposed raise amount (percentage or fixed)
- Proposed bonus amount
- State
- Filing status

### Optional Inputs
- Existing pre-tax contribution rates
- Timing assumptions (bonus month, raise effective date)

### Outputs
- Net annual difference by scenario
- Net monthly difference by scenario
- Estimated withholding effect explanation
- Marginal-rate explanation card

### Compare Modes
- Scenario A: raise only
- Scenario B: bonus only
- Scenario C: split raise + bonus

### Action Checklist
1. Select preferred comp structure based on net + cash-flow goals.
2. Update withholding estimate for chosen scenario.
3. Save scenario for negotiation reference.

### Confidence Prompt
\"Can you explain why bonus withholding can look high without changing your bracket rules?\"

---

## Template 3: Job Change + Withholding Reset
- **Template ID:** `job_change_withholding_reset`
- **Use case:** Model the tax impact of switching employers mid-year.

### Required Inputs
- Current salary and months worked
- New salary and projected start month
- Filing status
- State
- Current YTD withholding estimate

### Optional Inputs
- Sign-on bonus
- Equity or RSU estimate
- Gap months between jobs

### Outputs
- Projected annual tax from combined employers
- Under-withholding / over-withholding risk estimate
- Suggested withholding adjustment range
- End-of-year payment/refund probability

### Compare Modes
- New job base case
- New job + sign-on bonus
- New job + adjusted withholding

### Action Checklist
1. Reconcile YTD withholding from previous employer.
2. Apply updated W-4 strategy at new employer.
3. Set mid-year check-in reminder after two payroll cycles.

### Confidence Prompt
\"Do you feel ready to update your new-employer withholding without guessing?\"

---

## Implementation Notes
- Each project should be clonable and versioned (`v1`, `v2`, etc.).
- Comparison should show absolute delta and percentage delta.
- Keep explanations anchored to a small set of educational cards to avoid overwhelming users.
