import { em, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useMemo } from 'react'

export const useScreenSize = () => {
	const theme = useMantineTheme()
	const isLandscape = useMediaQuery(`(orientation: landscape) and (max-height: ${em(430)})`)

	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`) || isLandscape
	const isTablet =
		useMediaQuery(`(max-width: ${theme.breakpoints.sm}) and (min-width: ${theme.breakpoints.xs})`) &&
		!isLandscape
	const isSmallLandscape = useMediaQuery(
		`(orientation: landscape) and (max-height: ${em(376)}) and (max-width: ${theme.breakpoints.xs})`
	)

	const screenSizes = useMemo(
		() => ({ isMobile, isTablet, isLandscape, isSmallLandscape }),
		[isMobile, isTablet, isLandscape, isSmallLandscape]
	)
	return screenSizes
}
