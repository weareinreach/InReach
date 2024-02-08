import { Group, Menu, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import { isIdFor } from '@weareinreach/db/lib/idGen'
import { isExternal, Link } from '~ui/components/core/Link'
import { PhoneDrawer } from '~ui/components/data-portal/PhoneDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { parsePhoneNumber } from '~ui/hooks/usePhoneNumber'
import { useSlug } from '~ui/hooks/useSlug'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useCommonStyles } from './common.styles'
import { type PhoneNumbersProps } from './types'

export const PhoneNumbers = ({ edit, ...props }: PhoneNumbersProps) =>
	edit ? <PhoneNumbersEdit {...props} /> : <PhoneNumbersDisplay {...props} />

const PhoneNumbersDisplay = ({ parentId = '', passedData, direct, locationOnly }: PhoneNumbersProps) => {
	const output: ReactElement[] = []
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', 'phone-type', orgId.id] : ['common', 'phone-type'])
	const variants = useCustomVariant()
	const { data } = api.orgPhone.forContactInfo.useQuery({ parentId, locationOnly }, { enabled: !passedData })

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null

	for (const phone of componentData) {
		const { country, ext, locationOnly: showLocationOnly, number, phoneType, primary, description } = phone
		const parsedPhone = parsePhoneNumber(number, country)
		if (!parsedPhone) continue
		if (ext) parsedPhone.setExt(ext)
		const dialURL = parsedPhone.getURI()
		const phoneNumber = parsedPhone.formatNational()
		if (direct) {
			return (
				<Stack spacing={12}>
					<Title order={3}>{t('direct.phone')}</Title>
					{isExternal(dialURL) ? (
						<Link external href={dialURL} variant={variants.Link.inlineInverted}>
							{phoneNumber}
						</Link>
					) : (
						<Text>{phoneNumber}</Text>
					)}
				</Stack>
			)
		}
		if (locationOnly && !showLocationOnly) continue
		const desc = description
			? t(description.key, { ns: orgId?.id, defaultValue: description.defaultText })
			: phoneType?.key
				? t(phoneType.key, { ns: 'phone-type' })
				: undefined

		const item = (
			<Stack spacing={4} key={phone.id}>
				{isExternal(dialURL) ? (
					<Link external href={dialURL} variant={variants.Link.inlineInverted}>
						{phoneNumber}
					</Link>
				) : (
					<Text>{phoneNumber}</Text>
				)}
				{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
			</Stack>
		)
		primary ? output.unshift(item) : output.push(item)
	}
	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.phone')}</Title>
			{output}
		</Stack>
	)
}

const PhoneNumbersEdit = ({ parentId = '' }: PhoneNumbersProps) => {
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const { classes } = useCommonStyles()
	const slug = useSlug()
	const apiUtils = api.useUtils()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', 'phone-type', orgId.id] : ['common', 'phone-type'])
	const { data } = api.orgPhone.forContactInfoEdit.useQuery({ parentId })
	const isLocation = isIdFor('orgLocation', parentId)
	const { data: linkablePhones } = api.orgPhone.getLinkOptions.useQuery(
		{ slug, locationId: parentId },
		{
			enabled: isLocation,
		}
	)
	const linkToLocation = api.orgPhone.locationLink.useMutation({
		onSuccess: () => apiUtils.orgPhone.invalidate(),
	})
	const output = data?.map((phone) => {
		const { country, ext, number, phoneType, primary: _primary, description } = phone
		const parsedPhone = parsePhoneNumber(number, country)
		if (!parsedPhone) return null
		if (ext) parsedPhone.setExt(ext)

		const phoneNumber = parsedPhone.formatNational()

		const desc = description
			? t(description.key, { ns: orgId?.id, defaultValue: description.defaultText })
			: phoneType?.key
				? t(phoneType.key, { ns: 'phone-type' })
				: undefined

		const renderItem = () => {
			switch (true) {
				case phone.deleted: {
					return {
						number: (
							<Group spacing={4} noWrap>
								<Text variant={variants.Text.darkGrayStrikethru}>{phoneNumber}</Text>
							</Group>
						),
						desc: desc ? <Text variant={variants.Text.utility4darkGrayStrikethru}>{desc}</Text> : null,
					}
				}
				case !phone.published: {
					return {
						number: (
							<Group spacing={4} noWrap>
								<Icon icon='carbon:view-off' color={theme.other.colors.secondary.darkGray} height={24} />
								<Text variant={variants.Text.darkGray}>{phoneNumber}</Text>
							</Group>
						),
						desc: desc ? <Text variant={variants.Text.utility4darkGray}>{desc}</Text> : null,
					}
				}
				default: {
					return {
						number: <Text>{phoneNumber}</Text>,
						desc: desc ? <Text variant={variants.Text.utility4darkGray}>{desc}</Text> : null,
					}
				}
			}
		}

		const itemDisplay = renderItem()

		const item = (
			<Stack spacing={4} key={phone.id}>
				<PhoneDrawer id={phone.id} component={Link} variant={variants.Link.inlineInverted}>
					{itemDisplay.number}
				</PhoneDrawer>
				{itemDisplay.desc}
			</Stack>
		)
		return item
	})

	const addOrLink = isLocation ? (
		<Menu keepMounted withinPortal>
			<Menu.Target>
				<Link variant={variants.Link.inlineInverted}>
					<Group noWrap spacing={4}>
						<Icon icon='carbon:document-add' height={20} />
						<Text variant={variants.Text.utility3}>Link or create new...</Text>
					</Group>
				</Link>
			</Menu.Target>
			<Menu.Dropdown>
				{linkablePhones?.map(({ id, deleted, description, number, phoneType, published }) => {
					const phoneTextVariant =
						!published && deleted
							? variants.Text.utility3darkGrayStrikethru
							: deleted
								? variants.Text.utility3darkGrayStrikethru
								: variants.Text.utility3
					const descTextVariant =
						!published && deleted
							? variants.Text.utility4darkGrayStrikethru
							: deleted
								? variants.Text.utility4darkGrayStrikethru
								: variants.Text.utility4
					return (
						<Menu.Item
							key={id}
							onClick={() =>
								linkToLocation.mutate({ orgLocationId: parentId, orgPhoneId: id, action: 'link' })
							}
						>
							<Group noWrap>
								<Icon icon='carbon:link' />
								<Stack spacing={0}>
									<Text variant={phoneTextVariant}>{number}</Text>
									{Boolean(phoneType) && <Text variant={descTextVariant}>{phoneType}</Text>}
									<Text variant={descTextVariant}>{description}</Text>
								</Stack>
							</Group>
						</Menu.Item>
					)
				})}
				<Menu.Divider />
				<Menu.Item key='new'>
					<PhoneDrawer key='new' component={Link} external variant={variants.Link.inlineInverted} createNew>
						<Group noWrap>
							<Icon icon='carbon:add-alt' />
							<Text variant={variants.Text.utility3}>Create new</Text>
						</Group>
					</PhoneDrawer>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	) : (
		<PhoneDrawer key='new' component={Link} external variant={variants.Link.inlineInverted} createNew>
			<Group noWrap>
				<Icon icon='carbon:add' />
				<Text variant={variants.Text.utility3}>Create new</Text>
			</Group>
		</PhoneDrawer>
	)

	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.phone')}</Title>
			<Stack spacing={12} className={classes.overlay}>
				{output}
				<Stack spacing={4}>{addOrLink}</Stack>
			</Stack>
		</Stack>
	)
}
