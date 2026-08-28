/**
 * These match this project's custom theme breakpoints (theme/common.tsx's `breakpoints` - xs:500px, sm:768px,
 * md:1024px, lg:1200px, xl:1440px converted to em), NOT Mantine's own defaults - keep in sync by hand if the
 * theme changes.
 */
module.exports = {
	plugins: {
		'postcss-preset-mantine': {},
		'postcss-simple-vars': {
			variables: {
				'mantine-breakpoint-xs': '31.25em',
				'mantine-breakpoint-sm': '48em',
				'mantine-breakpoint-md': '64em',
				'mantine-breakpoint-lg': '75em',
				'mantine-breakpoint-xl': '90em',
			},
		},
	},
}
