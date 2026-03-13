import { CalendarDays, CircleCheck, Info, Sparkles } from "lucide-react";

export default function PersonalizedTaxPlanCard({
  plan,
  colors,
  fonts,
  shadows,
  hasFullAccess,
  onExportPlan,
  onUnlockPlan,
}) {
  if (!plan) return null;

  return (
    <div
      style={{
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: 24,
        padding: "26px 24px",
        boxShadow: shadows.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: `${colors.primary}12`,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Sparkles size={18} color={colors.primary} />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>{plan.title}</div>
          <div style={{ fontSize: 14, color: colors.textSec }}>{plan.subtitle}</div>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: fonts.sans, fontSize: 14, fontWeight: 700, color: colors.primary }}>
          Est. impact {plan.estimatedTotalImpact}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {plan.phases.map((phase) => (
          <div
            key={phase.id}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: "16px 16px 14px",
              background: `${colors.primary}03`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <CalendarDays size={16} color={colors.primary} />
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{phase.title}</div>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: colors.textSec }}>{phase.deadlineLabel}</span>
            </div>
            <div style={{ fontSize: 13, color: colors.textSec, marginBottom: 8 }}>
              Estimated impact: <strong style={{ color: colors.primary }}>{phase.estimatedImpact}</strong>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {phase.steps.map((step, idx) => (
                <div key={`${phase.id}-${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: colors.textSec, lineHeight: 1.45 }}>
                  <CircleCheck size={14} color={colors.success} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: colors.muted }}>
              Why this recommendation: {phase.why}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: colors.muted }}>{phase.confidenceNote}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          background: `${colors.info}06`,
          padding: "12px 14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
          <Info size={14} color={colors.info} />
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Assumptions & Sources</span>
        </div>
        <div style={{ fontSize: 12, color: colors.textSec, lineHeight: 1.5, marginBottom: 6 }}>{plan.assumptions}</div>
        <div style={{ fontSize: 12, color: colors.textSec, lineHeight: 1.5 }}>
          {plan.sourceCues.join(" • ")}.{" "}
          <a href="/resources" style={{ color: colors.primary, fontWeight: 700, textDecoration: "none" }}>
            View methodology resources
          </a>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={hasFullAccess ? onExportPlan : onUnlockPlan}
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            background: colors.primary,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: shadows.sm,
          }}
        >
          {hasFullAccess ? "Export Personalized Plan (PDF)" : "Unlock Full Plan + Export"}
        </button>
      </div>
      {!hasFullAccess && (
        <div style={{ marginTop: 8, fontSize: 12, color: colors.muted }}>
          You can keep exploring this preview. Upgrade only when you want the full timeline and PDF export.
        </div>
      )}
    </div>
  );
}
