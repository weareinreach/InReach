import { createStyles, rem } from '@mantine/core'

export const useCountrySelectStyles = createStyles(() => ({
	dropdown: {
		// This trigger sits at the far right edge of the phone number field, so Mantine's default
		// left-anchored dropdown positioning would expand it off past the right edge of the
		// screen. Anchoring the right edge instead makes it expand leftward, back over the phone
		// number field, which is also what keeps it fully on screen.
		width: 'max-content !important',
		left: 'unset !important',
		right: 0,
	},
	root: {
		width: rem(48),
	},
	input: {
		border: 'none',
		padding: 0,
		height: '2rem',
	},
	rightSection: {
		paddingRight: 0,
	},
}))
export const usePhoneEntryStyles = createStyles((theme) => ({
	rightSection: {
		padding: `0 ${rem(4)}`,
		margin: `${rem(2)} 0`,
		borderLeft: `1px solid ${theme.other.colors.primary.lightGray}`,
	},
}))
