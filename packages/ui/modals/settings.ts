import { useMediaQuery } from '@mantine/hooks'
import { type ModalSettings } from '@mantine/modals/lib/context'

import { commonTheme as theme } from '~ui/theme'

export const useModalProps = () => {
	const isMobile = useMediaQuery(`max-width: ${theme.breakpoints.sm}px`)

	return {
		fullScreen: isMobile,
	} satisfies ModalSettings
}
