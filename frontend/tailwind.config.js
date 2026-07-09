/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1B5E20",
        secondary: "#2E7D32",
        accent: "#66BB6A",
        background: "#F8FAF8",
        surface: "#FFFFFF",
        "surface-container": "#F3F4F6", // close to F8FAF8
        "surface-variant": "#E5E7EB", // equivalent to Border
        "on-surface": "#1F2937",
        "on-surface-variant": "#4B5563",
        "on-primary": "#FFFFFF",
        "on-secondary": "#FFFFFF",
        border: "#E5E7EB",
        danger: "#E53935",
        success: "#4CAF50",
        warning: "#FFB300",
        
        // Aliases to not break our previous classes immediately:
        "primary-container": "#2E7D32", 
        "on-primary-container": "#E8F5E9",
        "secondary-container": "#C8E6C9",
        "on-secondary-container": "#1B5E20",
        "surface-container-low": "#F9FAFB",
        "surface-container-high": "#F3F4F6",
        "outline-variant": "#E5E7EB",
      },
      borderRadius: {
        DEFAULT: "18px", // Blueprint radius
        sm: "8px",
        md: "12px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
        full: "9999px"
      },
      boxShadow: {
        DEFAULT: "0 8px 32px rgba(0,0,0,.08)", // Blueprint shadow
        md: "0 4px 16px rgba(0,0,0,.04)",
        lg: "0 8px 32px rgba(0,0,0,.08)",
      },
      spacing: {
        "max-width": "1280px",
        "margin-desktop": "48px",
        "margin-mobile": "16px",
        "safe": "env(safe-area-inset-bottom)"
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        
        // Aliases for our previous typography classes
        "display-lg-mobile": ["'Plus Jakarta Sans'"],
        "headline-lg-mobile": ["'Plus Jakarta Sans'"],
        "headline-lg": ["'Plus Jakarta Sans'"],
        "display-lg": ["'Plus Jakarta Sans'"],
        "headline-md": ["'Plus Jakarta Sans'"],
        "body-sm": ["Inter"],
        "body-md": ["Inter"],
        "body-lg": ["Inter"],
        "label-sm": ["Inter"],
        "label-lg": ["Inter"],
      },
      fontSize: {
        "display-lg-mobile": ["36px", {"lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "label-sm-mobile": ["10px", {"lineHeight": "14px", "fontWeight": "500"}],
        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
        "label-lg": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
