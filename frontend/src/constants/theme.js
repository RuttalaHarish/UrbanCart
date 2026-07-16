/**
 * UrbanCart Design System - JavaScript Tokens
 * Centralized theme configuration containing color tokens, typography scales,
 * spacing systems, border-radius, shadows, transitions, and breakpoints.
 */

export const theme = {
  // 1. Color Palette Tokens
  colors: {
    light: {
      primary: '#2563eb',          // Brand primary (Royal Blue)
      secondary: '#4f46e5',        // Brand secondary (Indigo)
      accent: '#d946ef',           // Accent elements (Magenta/Pink)
      success: '#10b981',          // Success states (Green)
      warning: '#f59e0b',          // Warning states (Amber)
      error: '#ef4444',            // Error states (Red)
      background: '#f8fafc',       // App background (Slate 50)
      surface: '#ffffff',          // Card & Container backgrounds
      border: '#e2e8f0',           // Border/Divider lines (Slate 200)
      textPrimary: '#0f172a',      // Primary readability text (Slate 900)
      textSecondary: '#64748b',    // Secondary body/muted text (Slate 500)
    },
    dark: {
      primary: '#3b82f6',          // Brand primary (Light Blue)
      secondary: '#6366f1',        // Brand secondary (Light Indigo)
      accent: '#e879f9',           // Accent elements
      success: '#34d399',          // Success states
      warning: '#fbbf24',          // Warning states
      error: '#f87171',            // Error states
      background: '#0f172a',       // App background (Slate 900)
      surface: '#1e293b',          // Container backgrounds (Slate 800)
      border: '#334155',           // Border/Divider lines (Slate 700)
      textPrimary: '#f8fafc',      // Primary readability text (Slate 50)
      textSecondary: '#94a3b8',    // Secondary body/muted text (Slate 400)
    }
  },

  // 2. Typography Scale (Fluid & Rem-based)
  typography: {
    fonts: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    sizes: {
      h1: '2.5rem',      // 40px - Page Title / Hero Heading
      h2: '2rem',        // 32px - Section Heading
      h3: '1.5rem',      // 24px - Subsections
      subheading: '1.25rem', // 20px - Card Headers/Highlights
      body: '1rem',      // 16px - Standard Paragraph/Body
      small: '0.875rem', // 14px - Captions, Labels, Helper Text
      button: '1rem',    // 16px - Button label sizing
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    }
  },

  // 3. Spacing Scale (4px Base System)
  spacing: {
    none: '0px',
    xxs: '0.25rem',   // 4px
    xs: '0.5rem',     // 8px
    sm: '0.75rem',    // 12px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
    xxxl: '4rem',     // 64px
  },

  // 4. Border Radius Scale
  radius: {
    none: '0px',
    xs: '0.125rem',   // 2px
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    xxl: '1rem',      // 16px
    full: '9999px',   // Pill / Circle
  },

  // 5. Shadow Scale
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // 6. Transition & Animation Variables
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',   // Hover effects, micro-animations
    default: '300ms cubic-bezier(0.4, 0, 0.2, 1)',// standard component state changes
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',   // Page transitions, modal openings
  },

  // 7. Responsive Media Breakpoints
  breakpoints: {
    mobile: '640px',   // Mobile layouts (max-width / min-width boundary)
    tablet: '768px',   // Tablet viewports
    desktop: '1024px', // Standard desktop monitors
    wide: '1280px',    // Larger desktop monitors
  }
};
