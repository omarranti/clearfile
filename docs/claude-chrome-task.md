# Claude Task: Run Taxed Billing Flow in Chrome

Use this task in Claude Desktop (or Claude with browser control) to execute and validate the new conversion + billing flow in Chrome.

## Goal

Validate the blended "Full X-Ray, Pay for Prescription" flow on production:
- Free full diagnostic is usable without signup
- Paywall appears at the right value cliffs
- Stripe checkout works for both plans
- Return flow unlocks access
- Post-payment account linking/claim works

## Environment

- Site URL: `https://taxedhq.com`
- Browser: Chrome
- Use test card: `4242 4242 4242 4242`, any future date, any CVC/ZIP
- If prompted for SCA (test mode), complete using default Stripe test flow

## Hard Rules

1. Do not change code.
2. Do not skip steps.
3. Capture evidence for each step (screenshot or precise notes).
4. Report pass/fail per step with exact observed text and URL.
5. If a step fails, continue with next independent step.

## Test Matrix

### A) Guest Free Experience (No Login)

1. Open `https://taxedhq.com`.
2. Click primary CTA to enter Tax Navigator.
3. Complete onboarding without creating account.
4. Verify calculator loads and full diagnostic UI is visible.
5. Move income slider across full range.

Expected:
- User can reach calculator without signup.
- Brackets/waterfall update in real time.
- No forced auth modal before diagnostics.

### B) Paywall Trigger: Income Cliff

1. As guest, move income above `$50,000`.
2. Observe whether paywall opens.

Expected:
- Paywall opens with unlock messaging.
- Plan cards visible:
  - Full Access: `$4.99/mo`
  - Pro + AI: `$9.99/mo`
- Mentions 3-month minimum.

### C) Paywall Trigger: Locked Opportunities

1. Close paywall if needed and continue.
2. In "Savings & Credits — Opportunity Map":
   - Confirm one opportunity card is fully revealed.
   - Confirm additional cards are locked with ranges.
3. Click "Unlock details" on a locked card.

Expected:
- Paywall opens.
- Locked card trigger reason is coherent.

### D) Paywall Trigger: Export

1. Click "Export PDF for CPA" as guest/non-entitled.

Expected:
- Export does not proceed directly.
- Paywall opens.

### E) Checkout Full Access

1. In paywall select **Full Access**.
2. Click unlock button.
3. Complete Stripe Checkout with test card.
4. Confirm redirect back to calculator with success query params.

Expected:
- Redirect to Stripe hosted checkout.
- Successful return to calculator (URL includes `checkout=success` and `session_id`).
- Access appears unlocked for Full Access scope.

### F) Post-Payment Account Capture

1. If still guest after payment, click navbar auth CTA.
2. Create account or log in with same email used in Stripe checkout.
3. Return to calculator.

Expected:
- Purchase is linked to account.
- Entitlement persists after refresh.
- Message indicates purchase/account linkage (or equivalent).

### G) Pro + AI Path

1. In a clean session (or incognito), repeat flow and choose **Pro + AI** at paywall.
2. Complete checkout.
3. Open AI assistant and test multiple prompts.

Expected:
- Pro unlock removes teaser limitation.
- AI works as paid unlimited mode.

### H) Non-Pro AI Limit Behavior

1. In non-Pro context (guest or Full Access only), open AI assistant.

Expected:
- Teaser/limited behavior visible.
- Upgrade path to Pro + AI presented.

## Report Format (Required)

Return a final report with this structure:

1. **Summary**
   - Overall result: PASS / PARTIAL / FAIL
   - Number of passed steps out of total

2. **Step Results**
   - A: PASS/FAIL + evidence
   - B: PASS/FAIL + evidence
   - C: PASS/FAIL + evidence
   - D: PASS/FAIL + evidence
   - E: PASS/FAIL + evidence
   - F: PASS/FAIL + evidence
   - G: PASS/FAIL + evidence
   - H: PASS/FAIL + evidence

3. **Defects**
   - For each defect: severity, exact repro steps, expected vs actual, URL, screenshot reference

4. **Blocking Issues**
   - List only release blockers

5. **Recommendations**
   - Top 3 fixes before broad launch

## One-line Task Prompt for Claude

Run the full Chrome QA workflow in docs/claude-chrome-task.md against https://taxedhq.com, execute steps A-H exactly, collect evidence, and return a strict PASS/FAIL report with defects and release blockers.
