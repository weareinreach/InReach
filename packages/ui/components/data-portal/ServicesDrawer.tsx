import {
	Box,
	type ButtonProps,
	Card,
	createPolymorphicComponent,
	Divider,
	Drawer,
	Group,
	rem,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, type ReactNode } from 'react'

import { Badge } from '~ui/components/core/Badge'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { useCustomVariant } from '~ui/hooks'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './ServicesDrawer.module.css'

const _ServicesDrawer = forwardRef<HTMLButtonElement, ServicesDrawerProps>((props, ref) => {
	const [opened, handler] = useDisclosure(true)
	const { id: organizationId } = useOrgInfo()
	const { t } = useTranslation(['services'])
	const variants = useCustomVariant()
	const { data } = api.service.forServiceDrawer.useQuery(
		{ organizationId: organizationId ?? '' },
		{ enabled: Boolean(organizationId), refetchOnWindowFocus: false }
	)

	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Breadcrumb option='close' onClick={handler.close} />
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack gap={24} align='center'>
							<Title order={2}>All services</Title>
							<UnstyledButton className={classes.addNewButton}>
								<Group wrap='nowrap' gap={8}>
									<Icon icon='carbon:add' className={classes.addNewText} height={24} />
									<Text variant={variants.Text.utility2} className={classes.addNewText}>
										Add new service
									</Text>
								</Group>
							</UnstyledButton>
							{data && (
								<Card w='100%'>
									<Stack gap={40}>
										{Object.entries(data).map(([key, value]) => {
											return (
												<Stack key={key}>
													<Badge.Service>{t(key, { ns: 'services' })}</Badge.Service>
													<Stack>
														{value.map(({ id, locations, name }) => {
															return (
																<UnstyledButton key={id} w='100%'>
																	<Group wrap='nowrap' justify='space-between'>
																		<Stack gap={8}>
																			<Text variant={variants.Text.utility1}>
																				{
																					t(name.tsKey ?? '', {
																						ns: name.tsNs,
																						defaultValue: name.defaultText,
																					}) satisfies ReactNode
																				}
																			</Text>
																			<Text variant={variants.Text.utility4darkGray} pb={12}>
																				Available at:{' '}
																				{locations.map((name, i, arr) => {
																					if (arr.length > i + 1)
																						return `${(<u key={`${id}-${i}`}>{name}</u>)}, `
																					if (arr.length === i + 1) {
																						if (arr.length > 1)
																							return `& ${(<u key={`${id}-${i}`}>{name}</u>)}`
																						return <u key={`${id}-${i}`}>{name}</u>
																					}
																				})}
																			</Text>
																		</Stack>
																		<Icon
																			icon='carbon:chevron-right'
																			height={24}
																			width={24}
																			style={{ minWidth: rem(24) }}
																		/>
																	</Group>
																	<Divider w='100%' />
																</UnstyledButton>
															)
														})}
													</Stack>
												</Stack>
											)
										})}
									</Stack>
								</Card>
							)}
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_ServicesDrawer.displayName = 'ServicesDrawer'

export const ServicesDrawer = createPolymorphicComponent<'button', ServicesDrawerProps>(_ServicesDrawer)

interface ServicesDrawerProps extends ButtonProps {
	x?: string
}
