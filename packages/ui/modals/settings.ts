import { useMediaQuery } from '@mantine/hooks'
import { type ModalSettings } from '@mantine/modals/lib/context'

import { commonTheme as theme } from '~ui/theme'

export const useIsMobile = () => useMediaQuery(`max-width: ${theme.breakpoints.sm}px`)

export const useModalDefaultProps = () => {
	return {
		fullScreen: useMediaQuery(`max-width: ${theme.breakpoints.sm}px`),
		radius: theme.radius.xl,
		centered: true,
		size: 'auto',
		withCloseButton: false,
	} satisfies ModalSettings
}
