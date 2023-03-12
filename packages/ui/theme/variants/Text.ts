import { rem } from '@mantine/core'

import { VariantObj } from '~ui/types/mantine'

export const Text = {
	utility1: (theme) => ({
		root: theme.other.utilityFonts.utility1,
	}),
	utility2: (theme) => ({
		root: theme.other.utilityFonts.utility2,
	}),
	utility3: (theme) => ({
		root: theme.other.utilityFonts.utility3,
	}),
	utility4: (theme) => ({
		root: theme.other.utilityFonts.utility4,
	}),
	utility1darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility1,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	utility2darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility2,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	utility3darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility3,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	utility4darkGray: (theme) => ({
		root: {
			...theme.other.utilityFonts.utility4,
			color: theme.other.colors.secondary.darkGray,
		},
	}),
	darkGray: (theme) => ({
		root: {
			color: theme.other.colors.secondary.darkGray,
		},
	}),
} satisfies VariantObj
