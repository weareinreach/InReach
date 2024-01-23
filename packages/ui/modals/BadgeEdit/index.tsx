import { zodResolver } from '@hookform/resolvers/zod'
import { Box, createPolymorphicComponent, Modal, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { compareArrayVals } from 'crud-object-diff'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { Chip } from 'react-hook-form-mantine'
import { z } from 'zod'

import { type ApiInput } from '@weareinreach/api'
import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useStyles } from './styles'
import { ModalTitle } from '../ModalTitle'

const FormSchema = z.object({
	id: z.string(),
	badges: z.string().array(),
})
type FormData = z.infer<typeof FormSchema>
const _BadgeEditModal = forwardRef<HTMLButtonElement, Props>(({ orgId, badgeType, ...props }, ref) => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const [opened, handler] = useDisclosure(false)
	const { data: initialData } = api.organization.forBadgeEditModal.useQuery({ id: orgId, badgeType })
	const form = useForm<FormData>({
		resolver: zodResolver(FormSchema),
		values: { id: orgId, badges: initialData ?? [] },
	})
	const { data: badgeOptions } = api.fieldOpt.orgBadges.useQuery({ badgeType })

	const updateAttributes = api.organization.updateAttributesBasic.useMutation({
		onSuccess: () => {
			apiUtil.organization.invalidate()
			form.reset()
			handler.close()
		},
	})

	const apiUtil = api.useUtils()

	const handleSubmit = () => {
		const data = form.getValues()
		const changes = compareArrayVals([initialData ?? [], data.badges])
		updateAttributes.mutate({ id: orgId, ...changes })
	}

	return (
		<>
			<Modal
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />}
				opened={opened}
				onClose={handler.close}
			>
				<Stack spacing={20} align='center'>
					<Title
						order={2}
					>{`Edit ${badgeType === 'organization-leadership' ? 'Organization Leadership' : 'Service Focus'} Badges`}</Title>
					<Chip.Group multiple control={form.control} name='badges'>
						<Stack spacing={12}>
							{badgeOptions &&
								badgeOptions.map(({ id, tsKey, tsNs, icon }) => (
									<Chip.Item key={id} value={id}>
										{`${icon} ${t(tsKey, { ns: tsNs })}`}
									</Chip.Item>
								))}
						</Stack>
					</Chip.Group>
					<Button
						variant='primary-icon'
						type='submit'
						fullWidth
						onClick={handleSubmit}
						disabled={!form.formState.isDirty}
						leftIcon={<Icon icon={updateAttributes.isSuccess ? 'carbon:checkmark' : 'carbon:save'} />}
						loading={updateAttributes.isLoading}
					>
						{t('save-changes')}
					</Button>
				</Stack>
			</Modal>
			<Box ref={ref} component='button' onClick={handler.open} className={classes.overlay} {...props} />
		</>
	)
})
_BadgeEditModal.displayName = 'BadgeEditModal'

export const BadgeEdit = createPolymorphicComponent<'button', Props>(_BadgeEditModal)

interface Props {
	orgId: string
	badgeType: ApiInput['fieldOpt']['orgBadges']['badgeType']
}
