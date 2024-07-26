import { Group, Menu, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useCallback } from 'react'

import { isIdFor } from '@weareinreach/db/lib/idGen'
import { isExternal, Link } from '~ui/components/core/Link'
import { PhoneDrawer } from '~ui/components/data-portal/PhoneDrawer'
import { AttributeEditWrapper } from '~ui/components/data-portal/ServiceEditDrawer/AttributeEditWrapper'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useEditMode } from '~ui/hooks/useEditMode'
import { isExtension, parsePhoneNumber } from '~ui/hooks/usePhoneNumber'
import { useSlug } from '~ui/hooks/useSlug'
import { Icon } from '~ui/icon'
import { nsFormatter } from '~ui/lib/nsFormatter'
import { trpc as api } from '~ui/lib/trpcClient'

import { useCommonStyles } from './common.styles'
import { type PhoneNumbersProps } from './types'

const formatNs = nsFormatter(['common', 'phone-type'])

export const PhoneNumbers = ({ edit, ...props }: PhoneNumbersProps) =>
	edit ? <PhoneNumbersEdit {...props} /> : <PhoneNumbersDisplay {...props} />

const PhoneNumbersDisplay = ({ parentId = '', passedData, direct, locationOnly }: PhoneNumbersProps) => {
	const output: ReactElement[] = []
	const slug = useSlug()
	const { isEditMode } = useEditMode()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(formatNs(orgId?.id))
	const variants = useCustomVariant()
	const { data } = api.orgPhone.forContactInfo.useQuery(
		{ parentId, locationOnly },
		{ enabled: !passedData, select: (data) => data?.map((res) => ({ ...res, active: undefined })) }
	)

	const componentData = passedData ?? data
	const getDescription = useCallback(
		(description: FreeTextItem | null, phoneType: FreeTextItem | null) => {
			if (description && orgId) {
				return t(description.key, { ns: orgId.id, defaultValue: description.defaultText })
			}
			if (phoneType) {
				return t(phoneType.key, { ns: 'phone-type' })
			}
			return null
		},
		[orgId, t]
	)

	if (!componentData?.length) {
		return null
	}

	for (const phone of componentData) {
		const { country, ext, locationOnly: showLocationOnly, number, phoneType, primary, description } = phone
		const parsedPhone = parsePhoneNumber(number, country)
		if (!parsedPhone || (locationOnly && !showLocationOnly)) {
			continue
		}
		if (isExtension(ext)) {
			parsedPhone.setExt(ext)
		}
		const dialURL = parsedPhone.getURI()
		const phoneNumber = parsedPhone.formatNational()
		const desc = getDescription(description, phoneType)

		const item = isEditMode ? (
			<AttributeEditWrapper key={phone.id} id={phone.id} active={phone.active ?? false}>
				<Stack spacing={4}>
					{isExternal(dialURL) ? (
						<Link external href={dialURL} variant={variants.Link.inlineInverted}>
							{phoneNumber}
						</Link>
					) : (
						<Text>{phoneNumber}</Text>
					)}
					{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
				</Stack>
			</AttributeEditWrapper>
		) : (
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
			<Title order={3}>{t(direct ? 'direct.phone' : 'words.phone')}</Title>
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
	const { t } = useTranslation(formatNs(orgId?.id))
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
	const getTextVariant = useCallback(
		(kind: 'value' | 'desc', published: boolean, deleted: boolean) => {
			const isValue = kind === 'value'
			if (deleted) {
				return isValue ? variants.Text.utility3darkGrayStrikethru : variants.Text.utility4darkGrayStrikethru
			}
			if (!published) {
				return isValue ? variants.Text.utility3darkGray : variants.Text.utility4darkGray
			}
			return isValue ? variants.Text.utility3 : variants.Text.utility4
		},
		[
			variants.Text.utility3,
			variants.Text.utility3darkGray,
			variants.Text.utility3darkGrayStrikethru,
			variants.Text.utility4,
			variants.Text.utility4darkGray,
			variants.Text.utility4darkGrayStrikethru,
		]
	)
	const getDescription = useCallback(
		(description: FreeTextItem | null, phoneType: FreeTextItem | null) => {
			if (description && orgId) {
				return t(description.key, { ns: orgId.id, defaultValue: description.defaultText })
			}
			if (phoneType) {
				return t(phoneType.key, { ns: 'phone-type' })
			}
			return null
		},
		[orgId, t]
	)
	const linkToLocationHandler = useCallback(
		(orgLocationId: string, orgPhoneId: string) => () =>
			linkToLocation.mutate({ orgLocationId, orgPhoneId, action: 'link' }),
		[linkToLocation]
	)
	const output = data?.map((phone) => {
		const { country, ext, number, phoneType, primary: _primary, description } = phone
		const parsedPhone = parsePhoneNumber(number, country)

		if (!parsedPhone) {
			return null
		}
		if (isExtension(ext)) {
			parsedPhone.setExt(ext)
		}

		const phoneNumber = parsedPhone.formatNational()

		const desc = getDescription(description, phoneType)

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
					const phoneTextVariant = getTextVariant('value', published, deleted)
					const descTextVariant = getTextVariant('desc', published, deleted)
					return (
						<Menu.Item key={id} onClick={linkToLocationHandler(parentId, id)}>
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

type FreeTextItem = {
	key: string
	defaultText: string
}
