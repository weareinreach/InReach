import {
	Box,
	type ButtonProps,
	Card,
	createPolymorphicComponent,
	createStyles,
	Divider,
	Drawer,
	Group,
	Modal,
	rem,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import compact from 'just-compact'
import { forwardRef, useEffect, useMemo } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { BadgeGroup, type ServiceTagProps } from '~ui/components/core/Badge'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { DataViewer } from '~ui/other/DataViewer'

import { InlineTextarea, InlineTextInput } from './InlineTextInput'

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
	badgeGroup: {
		width: '100%',
		cursor: 'pointer',
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		borderRadius: rem(8),
		padding: rem(4),
	},
	tealText: {
		color: theme.other.colors.secondary.teal,
	},
	dottedCard: {
		border: `${rem(1)} dashed ${theme.other.colors.secondary.teal}`,
		borderRadius: rem(16),
		padding: rem(20),
	},
}))
const _ServiceEditDrawer = forwardRef<HTMLButtonElement, ServiceEditDrawerProps>(
	({ serviceId, ...props }, ref) => {
		const [drawerOpened, drawerHandler] = useDisclosure(true)
		const [serviceModalOpened, serviceModalHandler] = useDisclosure(false)
		const { id: organizationId, slug: orgSlug } = useOrgInfo()
		const { classes } = useStyles()
		const form = useForm<FormData>()

		// #region Get existing data/populate form
		const { data, isLoading } = api.service.forServiceEditDrawer.useQuery(serviceId, {
			refetchOnWindowFocus: false,
		})
		useEffect(() => {
			if (data && !isLoading) {
				form.setValues(data)
				form.resetDirty()
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [data, isLoading])

		// #endregion

		// #region Get all available service options & filter selected
		const { data: allServices } = api.service.getOptions.useQuery(undefined, { refetchOnWindowFocus: false })

		const serviceBadges: ServiceTagProps[] = useMemo(() => {
			if (!form.values.services?.length || !allServices) return []

			return compact(
				form.values.services.map(({ id, categoryId }) => {
					const service = allServices.find((item) => item.id === id)
					if (service) {
						return {
							variant: 'service',
							tsKey: service.tsKey,
						}
					}
				})
			)
		}, [form.values.services, allServices])

		// #endregion

		// #region Get service area options
		const { data: geoMap } = api.fieldOpt.countryGovDistMap.useQuery(undefined, {
			refetchOnWindowFocus: false,
		})

		// #endregion

		return (
			<>
				<Drawer.Root onClose={drawerHandler.close} opened={drawerOpened} position='right'>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<Drawer.Header>
							<Breadcrumb option='close' onClick={drawerHandler.close} />
						</Drawer.Header>
						<Drawer.Body className={classes.drawerBody}>
							<Stack>
								<InlineTextInput fontSize='h2' {...form.getInputProps('serviceName.tsKey.text')} />
								<InlineTextarea
									fontSize='utility4'
									autosize
									{...form.getInputProps('description.tsKey.text')}
								/>
								{Boolean(serviceBadges.length) && (
									<>
										<BadgeGroup
											badges={serviceBadges}
											onClick={serviceModalHandler.open}
											className={classes.badgeGroup}
										/>
										<Modal opened={serviceModalOpened} onClose={serviceModalHandler.close} withCloseButton>
											Tag edit screen
										</Modal>
									</>
								)}
								{/* <Card> */}
								<Stack className={classes.dottedCard}>
									<Title order={2} className={classes.tealText}>
										Coverage Area
									</Title>
									{/* {Boolean(geoMap?.size) && } */}
								</Stack>
								{/* </Card> */}
							</Stack>
						</Drawer.Body>
					</Drawer.Content>
				</Drawer.Root>
				<Stack>
					<DataViewer value={data} />
					<Box component='button' onClick={drawerHandler.open} ref={ref} {...props} />
				</Stack>
			</>
		)
	}
)
_ServiceEditDrawer.displayName = 'ServiceEditDrawer'

export const ServiceEditDrawer = createPolymorphicComponent<'button', ServiceEditDrawerProps>(
	_ServiceEditDrawer
)

interface ServiceEditDrawerProps extends ButtonProps {
	serviceId: string
}

interface FreeText {
	id?: string
	key: string
	ns: string
	tsKey: {
		text: string | null
		crowdinId: number | null
	}
}
interface Attribute {
	attribute: {
		categories?: string[]
		id: string
		tsKey: string
		tsNs: string
		icon?: string | null
	}
	supplement: {
		id: string
		active?: boolean
		data: unknown
		boolean?: boolean | null
		countryId?: string | null
		govDistId?: string | null
		languageId?: string | null
		text: FreeText | null
	}[]
}
interface FormData {
	id: string
	published: boolean
	deleted: boolean
	serviceName: FreeText | null
	description: FreeText | null
	hours: {
		id: string
		dayIndex: number
		start: Date
		end: Date
		closed: boolean
		tz: string | null
	}[]
	phones: string[]
	emails: string[]
	locations: string[]
	services: {
		id: string
		categoryId: string
	}[]
	serviceAreas: {
		id: string
		countries: string[]
		districts: string[]
	} | null
	attributes: Attribute[]
	accessDetails: {
		id: string
		attributes: Attribute[]
	}[]
}
