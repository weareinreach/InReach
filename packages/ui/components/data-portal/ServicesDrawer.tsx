import {
	Box,
	type ButtonProps,
	Card,
	createPolymorphicComponent,
	createStyles,
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
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
	drawerBody: {
		padding: `${rem(40)} ${rem(32)}`,
		'&:not(:only-child)': {
			paddingTop: rem(40),
		},
	},
	addNewButton: {
		width: '100%',
		border: `${rem(1)} dashed ${theme.other.colors.secondary.teal}`,
		borderRadius: rem(8),
		padding: rem(12),
	},
	addNewText: {
		color: theme.other.colors.secondary.teal,
	},
}))

const _ServicesDrawer = forwardRef<HTMLButtonElement, ServicesDrawerProps>((props, ref) => {
	const [opened, handler] = useDisclosure(true)
	const { id: organizationId, slug: orgSlug } = useOrgInfo()
	const { classes } = useStyles()
	const { t } = useTranslation(['services'])
	const variants = useCustomVariant()
	const { data, isLoading } = api.service.forServiceDrawer.useQuery(
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
						<Stack spacing={24} align='center'>
							<Title order={2}>All services</Title>
							<UnstyledButton className={classes.addNewButton}>
								<Group noWrap spacing={8}>
									<Icon icon='carbon:add' className={classes.addNewText} height={24} />
									<Text variant={variants.Text.utility2} className={classes.addNewText}>
										Add new service
									</Text>
								</Group>
							</UnstyledButton>
							{data && (
								<Card w='100%'>
									<Stack spacing={40}>
										{Object.entries(data).map(([key, value]) => {
											return (
												<Stack key={key}>
													<Badge variant='service' tsKey={key} />
													<Stack>
														{value.map(({ id, locations, name, attributes }) => {
															return (
																<UnstyledButton key={id} w='100%'>
																	<Group noWrap position='apart'>
																		<Stack spacing={8}>
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
