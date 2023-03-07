import { useMediaQuery } from '@mantine/hooks'
import { ContextModalProps, ModalsProviderProps } from '@mantine/modals'
import { FC } from 'react'

import { commonTheme as theme } from '~ui/theme'

import { LoginModalBody } from './Login'
import { QuickPromotionModalBody } from './QuickPromotion'
import { ReviewModalBody } from './Review'
import { SignUpModalBody } from './SignUp'

const contextModalDefinitions: Record<string, FC<ContextModalProps<any>>> = {
	login: LoginModalBody,
	quickPromotion: QuickPromotionModalBody,
	signup: SignUpModalBody,
	review: ReviewModalBody,
} as const

export const useModalProps = () => {
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	return {
		modalProps: {
			fullScreen: isMobile,
		},
		modals: contextModalDefinitions,
	} satisfies Pick<ModalsProviderProps, 'modalProps' | 'modals'>
}
