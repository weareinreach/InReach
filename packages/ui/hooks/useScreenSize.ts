import { useMantineTheme, em } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

export const useScreenSize = () => {
	const theme = useMantineTheme()
	const isLandscape = useMediaQuery(`(orientation: landscape) and (max-height: ${em(430)})`)
	return {
		isMobile: useMediaQuery(`(max-width ${theme.breakpoints.xs})`) || isLandscape,
		isTablet:
			useMediaQuery(`(max-width ${theme.breakpoints.sm}) and (min-width ${theme.breakpoints.xs})`) &&
			!isLandscape,
		isLandscape,
		isSmallLandscape: useMediaQuery(
			`(orientation: landscape) and (max-height: ${em(376)}) and (max-width: ${theme.breakpoints.xs})`
		),
	}
}
