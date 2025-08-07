// Color palette for EMR application
export const COLORS = {
  // Primary medical blue
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#2563eb",
    600: "#1d4ed8",
    700: "#1e40af",
    800: "#1e3a8a",
    900: "#1e2a69",
  },
  
  // Medical green for success states
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#059669",
    600: "#047857",
    700: "#065f46",
    800: "#064e3b",
    900: "#022c22",
  },
  
  // Medical red for alerts/errors
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#dc2626",
    600: "#b91c1c",
    700: "#991b1b",
    800: "#7f1d1d",
    900: "#450a0a",
  },
  
  // Medical orange for warnings
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#d97706",
    600: "#b45309",
    700: "#92400e",
    800: "#78350f",
    900: "#451a03",
  },
  
  // Neutral grays
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
} as const;

// Typography scale
export const TYPOGRAPHY = {
  fontFamily: {
    primary: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Monaco", "Consolas", "monospace"],
  },
  
  fontSize: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing scale
export const SPACING = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem",   // 64px
} as const;

// Border radius
export const BORDER_RADIUS = {
  none: "0",
  sm: "0.125rem",   // 2px
  md: "0.375rem",   // 6px
  lg: "0.5rem",     // 8px
  xl: "0.75rem",    // 12px
  "2xl": "1rem",    // 16px
  full: "9999px",
} as const;

// Shadows for medical application depth
export const SHADOWS = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  medical: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  "medical-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
} as const;

// Animation durations
export const ANIMATIONS = {
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
  slower: "500ms",
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Z-index layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

// Medical specific theme values
export const MEDICAL_THEME = {
  // Status colors for patient conditions
  status: {
    critical: COLORS.error[500],
    warning: COLORS.warning[500],
    stable: COLORS.success[500],
    monitoring: COLORS.primary[500],
    discharged: COLORS.neutral[500],
  },
  
  // Priority levels
  priority: {
    low: COLORS.success[500],
    medium: COLORS.warning[500],
    high: COLORS.error[500],
    urgent: COLORS.error[700],
  },
  
  // Department colors
  departments: {
    emergency: COLORS.error[500],
    cardiology: COLORS.error[400],
    neurology: COLORS.primary[500],
    pediatrics: COLORS.success[400],
    oncology: COLORS.neutral[600],
    orthopedics: COLORS.warning[500],
  },
} as const;

// Export the complete theme
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  medical: MEDICAL_THEME,
} as const;

export default THEME;
