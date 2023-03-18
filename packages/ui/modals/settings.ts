import { useMediaQuery } from '@mantine/hooks'
import { ContextModalProps, ModalsProviderProps } from '@mantine/modals'
import { FC } from 'react'

import { commonTheme as theme } from '~ui/theme'

import { DeleteModalBody } from './DeleteModal'
import { ForgotPasswordModalBody } from './ForgotPassword'
import { LoginModalBody } from './Login'
import { PrivacyStatementModalBody } from './PrivacyStatement'
import { QuickPromotionModalBody } from './QuickPromotion'
import { ReviewModalBody } from './Review'
import { ServiceModalBody } from './Service'

const contextModalDefinitions: Record<string, FC<ContextModalProps<any>>> = {
	login: LoginModalBody,
	quickPromotion: QuickPromotionModalBody,
	delete: DeleteModalBody,
	review: ReviewModalBody,
	forgotPassword: ForgotPasswordModalBody,
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
declare module '@mantine/modals' {
	export interface MantineModalsOverride {
		modals: typeof contextModalDefinitions
	}
}
