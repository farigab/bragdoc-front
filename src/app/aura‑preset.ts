import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export const CustomAuraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#6B5DD3',   // --primary
      600: '#7B69E0',   // --primary-hover
      700: '#5B4DC0',
      800: '#4C3FA8',
      900: '#3D3289',
      950: '#2E256A'
    },
    colorScheme: {
      dark: {
        primary: {
          color: '#6B5DD3',
          contrastColor: '#ffffff',
          hoverColor: '#7B69E0',
          activeColor: '#5B4DC0'
        },
        surface: {
          0: '#1C1B29',      // --bg
          50: '#2A273D',     // --surface
          100: '#2A273D',
          200: '#2A273D',
          300: '#443F5E',    // --border
          400: '#443F5E',
          500: '#443F5E',
          600: '#2A273D',
          700: '#2A273D',
          800: '#1C1B29',
          900: '#1C1B29',
          950: '#1C1B29'
        },
        text: {
          color: '#E0DAFF',        // --text-primary
          hoverColor: '#E0DAFF',
          mutedColor: '#BFB3F2',   // --text-secondary
          hoverMutedColor: '#BFB3F2'
        }
      }
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '#6B5DD3',
      offset: '2px'
    }
  },
  components: {
    button: {
      root: {
        borderRadius: '10px',
        paddingX: '16px',
        paddingY: '10px',
        sm: {
          fontSize: '0.875rem',
          paddingX: '12px',
          paddingY: '8px'
        },
        lg: {
          fontSize: '1.125rem',
          paddingX: '20px',
          paddingY: '12px'
        }
      },
      colorScheme: {
        dark: {
          root: {
            primary: {
              background: '#6B5DD3',
              hoverBackground: '#7B69E0',
              activeBackground: '#5B4DC0',
              borderColor: 'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor: 'transparent',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff'
            },
            secondary: {
              background: 'transparent',
              hoverBackground: 'rgba(107, 93, 211, 0.05)',
              activeBackground: 'rgba(107, 93, 211, 0.1)',
              borderColor: '#443F5E',
              hoverBorderColor: '#6B5DD3',
              activeBorderColor: '#6B5DD3',
              color: '#E0DAFF',
              hoverColor: '#E0DAFF',
              activeColor: '#E0DAFF'
            },
            success: {
              background: '#9BFFA1',
              hoverBackground: '#8BEF91',
              activeBackground: '#7BDF81',
              borderColor: 'transparent',
              color: '#1C1B29',
              hoverColor: '#1C1B29',
              activeColor: '#1C1B29'
            },
            warn: {
              background: '#FFD37F',
              hoverBackground: '#FFC36F',
              activeBackground: '#FFB35F',
              borderColor: 'transparent',
              color: '#1C1B29',
              hoverColor: '#1C1B29',
              activeColor: '#1C1B29'
            },
            danger: {
              background: '#FF9BFF',
              hoverBackground: '#FF8BFF',
              activeBackground: '#FF7BFF',
              borderColor: 'transparent',
              color: '#1C1B29',
              hoverColor: '#1C1B29',
              activeColor: '#1C1B29'
            }
          }
        }
      }
    },
    card: {
      root: {
        borderRadius: '12px',
        shadow: '0 4px 12px rgba(107, 93, 211, 0.3)'
      },
      colorScheme: {
        dark: {
          root: {
            background: '#2A273D',
            color: '#E0DAFF'
          }
        }
      }
    },
    inputtext: {
      root: {
        borderRadius: '8px',
        paddingX: '12px',
        paddingY: '10px'
      },
      colorScheme: {
        dark: {
          root: {
            background: '#2A273D',
            disabledBackground: '#1C1B29',
            filledBackground: '#2A273D',
            filledFocusBackground: '#2A273D',
            borderColor: '#443F5E',
            hoverBorderColor: '#6B5DD3',
            focusBorderColor: '#6B5DD3',
            invalidBorderColor: '#FF9BFF',
            color: '#E0DAFF',
            disabledColor: '#7F6FD1',
            placeholderColor: '#BFB3F2',
            shadow: 'none',
            focusRing: {
              width: '0',
              style: 'none',
              color: 'transparent',
              offset: '0',
              shadow: '0 0 6px rgba(107, 93, 211, 0.3)'
            }
          }
        }
      }
    },
    dropdown: {
      root: {
        borderRadius: '8px',
        paddingX: '12px',
        paddingY: '10px'
      },
      colorScheme: {
        dark: {
          root: {
            background: '#2A273D',
            disabledBackground: '#1C1B29',
            borderColor: '#443F5E',
            hoverBorderColor: '#6B5DD3',
            focusBorderColor: '#6B5DD3',
            color: '#E0DAFF',
            disabledColor: '#7F6FD1',
            placeholderColor: '#BFB3F2'
          }
        }
      }
    },
    datatable: {
      colorScheme: {
        dark: {
          root: {
            borderColor: '#443F5E'
          },
          header: {
            background: 'transparent',
            borderColor: '#443F5E',
            color: '#E0DAFF'
          },
          row: {
            background: 'transparent',
            hoverBackground: 'rgba(107, 93, 211, 0.05)',
            selectedBackground: 'rgba(107, 93, 211, 0.1)',
            color: '#E0DAFF',
            hoverColor: '#E0DAFF',
            selectedColor: '#E0DAFF'
          },
          bodyCell: {
            borderColor: '#443F5E'
          }
        }
      }
    }
  }
});
