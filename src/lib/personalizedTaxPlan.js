function fmtCurrency(n) {
  return `$${Math.round(Math.max(0, Number(n) || 0)).toLocaleString()}`;
}

function nextQuarterDeadlineLabel(now = new Date()) {
  const y = now.getFullYear();
  const quarterDeadlines = [
    new Date(y, 3, 15),
    new Date(y, 5, 15),
    new Date(y, 8, 15),
    new Date(y + 1, 0, 15),
  ];
  const next = quarterDeadlines.find((d) => d >= now) || quarterDeadlines[0];
  return next.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function buildPersonalizedTaxPlan({
  report,
  opportunities = [],
  incomeType = "w2",
  hasPenalty = false,
  hasStudentLoans = false,
  hasRetirement = false,
  hasHDHP = false,
  filingStatusLabel = "Single",
  stateLabel = "California",
}) {
  const isCalifornia = stateLabel === "California";
  const top = opportunities[0];
  const secondary = opportunities[1];
  const estimatedTotal =
    (hasPenalty && report?.penalty?.ftaSavings ? report.penalty.ftaSavings : 0) +
    (top?.estimate || 0) +
    (secondary?.estimate || 0);

  const phases = [
    {
      id: "this-week",
      title: "This Week",
      deadlineLabel: "Start now",
      estimatedImpact: fmtCurrency(top?.estimate || 0),
      confidenceNote: "High confidence if you complete all listed steps this week.",
      steps: [
        `Save this scenario for ${filingStatusLabel} in ${stateLabel}.`,
        `Review your top opportunity: ${top?.name || "Primary tax credit"}.`,
        hasPenalty && report?.penalty
          ? `Call IRS at ${report.penalty.irsPhone} and request First-Time Penalty Abatement.`
          : "Confirm your withholding and expected total tax owed with your CPA.",
      ].filter(Boolean),
      why: "The first move captures the largest immediate savings and reduces penalty risk.",
    },
    {
      id: "before-quarter-end",
      title: "Before Quarter End",
      deadlineLabel:
        incomeType === "1099" || incomeType === "mixed"
          ? `Next estimate due: ${nextQuarterDeadlineLabel()}`
          : "Before your next payroll cycle",
      estimatedImpact: fmtCurrency(secondary?.estimate || 0),
      confidenceNote: "Medium-high confidence depending on contribution capacity.",
      steps: [
        incomeType === "1099" || incomeType === "mixed"
          ? "Set aside a fixed percentage from each invoice for quarterly taxes."
          : "Adjust payroll withholding if your projected tax is off target.",
        hasRetirement
          ? "Increase traditional retirement contributions if cash flow allows."
          : "Evaluate opening a Traditional IRA for pre-tax savings.",
        hasHDHP
          ? "Maximize HSA contributions if eligible."
          : "Check HSA eligibility for additional tax-advantaged contributions.",
      ],
      why: "Quarter-end changes improve cash flow and prevent compounding underpayment risk.",
    },
    {
      id: "before-april-15",
      title: "Before April 15",
      deadlineLabel: "File + finalize",
      estimatedImpact: fmtCurrency(estimatedTotal),
      confidenceNote: "Estimated impact is directional and should be validated with filing docs.",
      steps: [
        "Bring this report and action checklist to your CPA.",
        hasStudentLoans ? "Include Form 1098-E to confirm student loan interest deduction." : "Confirm all credits and deductions before filing.",
        "Export your report PDF and keep a copy with filing records.",
      ],
      why: "Bundling documentation and decisions before filing improves final return accuracy.",
    },
  ];

  return {
    title: "Personalized Tax Plan",
    subtitle: "A clear timeline based on your current scenario.",
    assumptions: isCalifornia
      ? "Estimates use current federal and California bracket logic in this tool, common credit eligibility rules, and your selected profile inputs."
      : `Estimates use current federal bracket logic and directional ${stateLabel} planning assumptions. State-specific results outside California should be validated with a state-specific calculator or CPA.`,
    sourceCues: [
      "IRS published bracket and deduction guidance",
      isCalifornia ? "California tax rules as modeled in Taxed" : "State estimate modeled directionally for planning",
      "Educational planning assumptions (not filing advice)",
    ],
    estimatedTotalImpact: fmtCurrency(estimatedTotal),
    phases,
  };
}
