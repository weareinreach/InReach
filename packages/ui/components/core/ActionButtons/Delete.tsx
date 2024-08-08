import { Box, Group, Modal, Stack, Text, useMantineTheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Button, type ButtonProps } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'

import { useStyles } from './styles'

export const Delete = forwardRef<HTMLButtonElement, DeleteProps>(
	({ omitLabel, className, onClick, modalHandler, ...props }, ref) => {
		const { classes, cx } = useStyles()
		const theme = useMantineTheme()
		const variant = useCustomVariant()
		const { t } = useTranslation('common')
		const defaultHandler = useDisclosure(false)
		const [confirmDialogOpen, confirmDialogHandler] = modalHandler ?? defaultHandler
		return (
			<>
				<Box
					component={Button}
					ref={ref}
					onClick={confirmDialogHandler.open}
					className={cx(classes.button, className)}
					{...props}
				>
					<Group spacing={0} noWrap>
						<Icon
							icon='carbon:trash-can'
							color={theme.other.colors.secondary.black}
							className={classes.icon}
							height={24}
							width={24}
						/>
						{!omitLabel && <Text className={classes.text}>{t('words.delete')}</Text>}
					</Group>
				</Box>
				<Modal opened={confirmDialogOpen} onClose={confirmDialogHandler.close}>
					<Stack align='center'>
						<Text>{t('confirm-modal.delete-list')}</Text>
						<Group noWrap>
							<Button variant={variant.Button.primaryLgRed} onClick={onClick}>
								{t('words.delete')}
							</Button>
							<Button variant={variant.Button.secondaryLg} onClick={confirmDialogHandler.close}>
								{t('words.cancel')}
							</Button>
						</Group>
					</Stack>
				</Modal>
			</>
		)
	}
)
Delete.displayName = 'ActionButtons.Delete'

export interface DeleteProps extends ButtonProps {
	omitLabel?: boolean
	onClick: () => void
	modalHandler?: ReturnType<typeof useDisclosure>
}
