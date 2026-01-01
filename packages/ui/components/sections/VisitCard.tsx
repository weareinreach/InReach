import { Card, createStyles, Group, rem, Stack, Text, Title, Tooltip, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'

import { AddressVisibility } from '@weareinreach/db/enums'
import { Badge } from '~ui/components/core/Badge'
import { Link } from '~ui/components/core/Link'
import { AddressDrawer } from '~ui/components/data-portal/AddressDrawer'
import { useCustomVariant, useFormattedAddress, useScreenSize } from '~ui/hooks'
import { Icon, validateIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

export const VisitCard = ({ edit = false, ...props }: VisitCardProps & { edit?: boolean }) =>
	edit ? <VisitCardEdit {...props} /> : <VisitCardDisplay {...props} />

const VisitCardDisplay = ({ locationId }: VisitCardProps) => {
	const { isMobile } = useScreenSize()
	const { t } = useTranslation(['common', 'attribute'])
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const { data } = api.location.forVisitCard.useQuery(locationId)

	const formattedAddress = useFormattedAddress(data)
	const hasMapData = !!data?.latitude && !!data?.longitude && !!data?.name

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	if (!data) {
		return null
	}

	const address = formattedAddress && (
		<Stack spacing={12}>
			<Title order={3}>
				{t(hasMapData ? 'words.address' : 'words.location', {
					context: data.remote ? 'physical' : undefined,
				})}
			</Title>
			<Text>{formattedAddress}</Text>
		</Stack>
	)

	const remoteSection = data.remote && (
		<Stack spacing={12}>
			<Badge.Attribute icon={validateIcon(data.remote.icon)}>
				{t(data.remote.tsKey, { ns: 'attribute' })}
			</Badge.Attribute>
			<Text variant={variants.Text.utility2}>{t('remote-services')}</Text>
		</Stack>
	)

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('visit')}</Title>
			{address}
			{remoteSection}
			{/* <Hours parentId={locationId} /> */}
			{/* TODO: [IN-807] Validate accessibility data points before enabling.
			<Stack spacing={12} align='flex-start'>
				<Badge
					variant='attribute'
					tsNs='attribute'
					tsKey='additional.wheelchair-accessible'
					tProps={{ context: `${isAccessible}` }}
					icon={isAccessible ? 'carbon:accessibility' : 'carbon:warning'}
					style={{ marginLeft: 0 }}
				/>
				<Text variant={variants.Text.utility2}>
					{t('accessible-building', { context: `${isAccessible}` })}
				</Text>
			</Stack> */}
		</Stack>
	)
	if (!formattedAddress && !data.hasHours) {
		return null
	}

	return isTablet ? body : <Card>{body}</Card>
}

const useEditStyles = createStyles((theme) => ({
	overlay: {
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		borderRadius: rem(16),
		margin: rem(-8),
	},
	overlayInner: {
		padding: rem(8),
	},
}))
const VisitCardEdit = ({ locationId }: VisitCardProps) => {
	const { isMobile } = useScreenSize()
	const { classes } = useEditStyles()
	const { t } = useTranslation(['common', 'attribute'])
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const { data } = api.location.forVisitCardEdits.useQuery(locationId)

	const formattedAddress = useFormattedAddress(data)
	const hasMapData = !!data?.latitude && !!data?.longitude && !!data?.name

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	if (!data) {
		return null
	}

	const addressHiddenIcon = (
		<Tooltip label='Address is hidden' withinPortal>
			<Icon icon='carbon:view-off' />
		</Tooltip>
	)

	const address = formattedAddress && (
		<Stack spacing={12}>
			<Title order={3}>
				{t(hasMapData ? 'words.address' : 'words.location', {
					context: data.remote ? 'physical' : undefined,
				})}
			</Title>
			<Group>
				{data.addressVisibility === AddressVisibility.HIDDEN && addressHiddenIcon}
				<AddressDrawer
					locationId={locationId}
					external
					component={Link}
					variant={variants.Link.inlineInverted}
					className={classes.overlay}
				>
					<Text className={classes.overlayInner}>{formattedAddress}</Text>
				</AddressDrawer>
			</Group>
		</Stack>
	)

	const remoteSection = data.remote && (
		<Stack spacing={12}>
			<Badge.Attribute icon={validateIcon(data.remote.icon)}>
				{t(data.remote.tsKey, { ns: 'attribute' })}
			</Badge.Attribute>
			<Text variant={variants.Text.utility2}>{t('remote-services')}</Text>
		</Stack>
	)

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('visit')}</Title>
			{address}
			{remoteSection}
			{/* <Hours parentId={locationId} edit /> */}
		</Stack>
	)

	return isTablet ? body : <Card>{body}</Card>
}

export interface VisitCardProps {
	locationId: string
}
