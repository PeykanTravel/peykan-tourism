// Apple-inspired Design System for Peykan Tourism
// Based on Apple's design principles: clarity, deference, and depth

export const appleTheme = {
  // Color Palette - Apple-inspired
  colors: {
    // Primary Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Neutral Colors (Apple's signature grays)
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // Accent Colors
    accent: {
      blue: '#007AFF',
      green: '#34C759',
      orange: '#FF9500',
      red: '#FF3B30',
      purple: '#AF52DE',
      pink: '#FF2D92',
      yellow: '#FFCC00',
    },
    
    // Background Colors
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f7',
      tertiary: '#fafafa',
      dark: '#000000',
      darkSecondary: '#1c1c1e',
    },
    
    // Text Colors
    text: {
      primary: '#1d1d1f',
      secondary: '#86868b',
      tertiary: '#a1a1a6',
      inverse: '#ffffff',
      accent: '#007AFF',
    },
    
    // Border Colors
    border: {
      light: '#e5e5e7',
      medium: '#d2d2d7',
      dark: '#c7c7cc',
    },
    
    // Status Colors
    status: {
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',
    }
  },
  
  // Typography - Apple's SF Pro inspired
  typography: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"SF Pro Display"',
        '"SF Pro Text"',
        'system-ui',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif'
      ],
      mono: [
        '"SF Mono"',
        'Monaco',
        'Inconsolata',
        '"Roboto Mono"',
        'monospace'
      ]
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem',     // 128px
    },
    
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    }
  },
  
  // Spacing - Apple's 8pt grid system
  spacing: {
    0: '0px',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    28: '7rem',     // 112px
    32: '8rem',     // 128px
    36: '9rem',     // 144px
    40: '10rem',    // 160px
    44: '11rem',    // 176px
    48: '12rem',    // 192px
    52: '13rem',    // 208px
    56: '14rem',    // 224px
    60: '15rem',    // 240px
    64: '16rem',    // 256px
    72: '18rem',    // 288px
    80: '20rem',    // 320px
    96: '24rem',    // 384px
  },
  
  // Border Radius - Apple's rounded corners
  borderRadius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows - Apple's depth system
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Apple-specific shadows
    apple: {
      small: '0 2px 8px rgba(0, 0, 0, 0.12)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
      large: '0 8px 32px rgba(0, 0, 0, 0.12)',
      xlarge: '0 16px 64px rgba(0, 0, 0, 0.12)',
    }
  },
  
  // Transitions - Apple's smooth animations
  transition: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    }
  },
  
  // Breakpoints - Apple's responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  }
}

// Utility functions for the theme
export const appleUtils = {
  // Get color with opacity
  colorWithOpacity: (color: string, opacity: number) => {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
  },
  
  // Apple-style gradient backgrounds
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    dark: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    light: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  
  // Apple-style blur effects
  backdropBlur: {
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
  },
  
  // Apple-style glass morphism
  glass: {
    light: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.25)',
  }
}

// Component-specific styles
export const appleComponents = {
  // Button styles
  button: {
    primary: {
      base: 'bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg',
      large: 'bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-lg',
      small: 'bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-all duration-300 shadow-sm hover:shadow-md text-sm',
    },
    secondary: {
      base: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-6 py-3 rounded-lg transition-all duration-300 border border-gray-200',
      large: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-all duration-300 border border-gray-200 text-lg',
      small: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-4 py-2 rounded-md transition-all duration-300 border border-gray-200 text-sm',
    },
    outline: {
      base: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg transition-all duration-300',
      large: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-lg',
      small: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium px-4 py-2 rounded-md transition-all duration-300 text-sm',
    }
  },
  
  // Card styles
  card: {
    base: 'bg-white rounded-2xl shadow-apple-medium border border-gray-100 overflow-hidden',
    elevated: 'bg-white rounded-2xl shadow-apple-large border border-gray-100 overflow-hidden',
    glass: 'bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-apple-medium',
  },
  
  // Input styles
  input: {
    base: 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white',
    large: 'w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white text-lg',
    small: 'w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white text-sm',
  },
  
  // Navigation styles
  nav: {
    base: 'bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50',
    dark: 'bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50',
  }
}

export default appleTheme 