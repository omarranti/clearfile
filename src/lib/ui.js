/** Shared UI constants — single source of truth for font stacks and glass effects */

export const font = {
  serif: "'DM Serif Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
};

export const glass = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid #e7ebf0",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

export const navGlass = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(20px) saturate(125%)",
  WebkitBackdropFilter: "blur(20px) saturate(125%)",
};

/** Brand color tokens */
export const color = {
  accent: "#1f9d8b",
  accentBg: "rgba(31,157,139,0.10)",
  text: "#102a43",
  textSecondary: "#4f6478",
  textMuted: "#6b7f93",
  surface: "#f7f8fa",
  dark: "#13283e",
  border: "#e2e7ed",
};
