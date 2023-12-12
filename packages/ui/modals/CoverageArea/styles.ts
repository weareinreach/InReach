import { createStyles, rem } from '@mantine/core'

export const useStyles = createStyles((theme) => ({
	borderedBox: {
		padding: rem(20),
		border: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
		borderRadius: rem(8),
	},
	locationBadge: {
		padding: `${rem(0)} ${rem(12)}`,
		borderColor: `${theme.other.colors.tertiary.coolGray}`,
		'& *, & .mantine-Text-root': {
			...theme.other.utilityFonts.utility1,
		},
	},
	noHoverHighlight: {
		'&:hover': { backgroundColor: 'inherit' },
	},
	ModalContent: {
		'& > *': { width: '100%' },
	},
	selectSectionWrapper: {
		'& .mantine-Select-input, & .mantine-Select-input::-webkit-input-placeholder': {
			...theme.other.utilityFonts.utility1,
			margin: rem(0),
		},
		'& *': {
			...theme.other.utilityFonts.utility1,
		},
		'& .mantine-Select-rightSection': {
			justifyContent: 'end',
		},
	},
}))
