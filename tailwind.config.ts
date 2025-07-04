import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2rem',
				'2xl': '2rem'
			},
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			},
			minHeight: {
				'screen-75': '75vh',
			},
			fontSize: {
				'55': '55rem',
			},
			opacity: {
				'80': '.8',
			},
			zIndex: {
				'2': 2,
				'3': 3,
			},
			inset: {
				'-100': '-100%',
				'-225-px': '-225px',
				'-160-px': '-160px',
				'-150-px': '-150px',
				'-94-px': '-94px',
				'-50-px': '-50px',
				'-29-px': '-29px',
				'-20-px': '-20px',
				'25-px': '25px',
				'40-px': '40px',
				'95-px': '95px',
				'145-px': '145px',
				'195-px': '195px',
				'210-px': '210px',
				'260-px': '260px',
			},
			height: {
				'95-px': '95px',
				'70-px': '70px',
				'350-px': '350px',
				'500-px': '500px',
				'600-px': '600px',
			},
			maxHeight: {
				'860-px': '860px',
			},
			maxWidth: {
				'100-px': '100px',
				'120-px': '120px',
				'150-px': '150px',
				'180-px': '180px',
				'200-px': '200px',
				'210-px': '210px',
				'580-px': '580px',
			},
			minWidth: {
				'140-px': '140px',
				'48': '12rem',
			},
			backgroundSize: {
				full: '100%',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
