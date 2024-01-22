import { zodResolver } from '@hookform/resolvers/zod'
import { Box, createPolymorphicComponent, Modal, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { Chip } from 'react-hook-form-mantine'
import { z } from 'zod'

import { type ApiInput } from '@weareinreach/api'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from '../ModalTitle'

const FormSchema = z.object({
	id: z.string(),
	badges: z.string().array(),
})
const _BadgeEditModal = forwardRef<HTMLButtonElement, Props>(({ orgId, badgeType, ...props }, ref) => {
	const { t } = useTranslation()
	const [opened, handler] = useDisclosure(true)
	const { data: badgeOptions } = api.fieldOpt.orgBadges.useQuery({ badgeType })

	const apiUtil = api.useUtils()
	const { control } = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: async () => {
			const data = await apiUtil.organization.forBadgeEditModal.fetch({ id: orgId, badgeType })
			return {
				id: orgId,
				badges: data ?? [],
			}
		},
	})

	return (
		<>
			<Modal
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />}
				opened={opened}
				onClose={handler.close}
			>
				<Chip.Group multiple control={control} name='badges'>
					<Stack spacing={12}>
						{badgeOptions &&
							badgeOptions.map(({ id, tsKey, tsNs, icon }) => (
								<Chip.Item key={id} value={id}>
									{`${icon} ${t(tsKey, { ns: tsNs })}`}
								</Chip.Item>
							))}
					</Stack>
				</Chip.Group>
			</Modal>
			<Box ref={ref} component='button' onClick={handler.open} {...props} />
		</>
	)
})
_BadgeEditModal.displayName = 'BadgeEditModal'

export const BadgeEditModal = createPolymorphicComponent<'button', Props>(_BadgeEditModal)

interface Props {
	orgId: string
	badgeType: ApiInput['fieldOpt']['orgBadges']['badgeType']
}
