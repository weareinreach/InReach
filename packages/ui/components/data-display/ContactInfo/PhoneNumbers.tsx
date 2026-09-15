import { Group, Menu, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next/pages'
import { type ReactElement, useCallback, useState } from 'react'

import { productEvent } from '@weareinreach/analytics/events'
import { generateId, isIdFor } from '@weareinreach/db/lib/idGen'
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

import classes from './common.module.css'
import { type PhoneNumbersProps } from './types'

const formatNs = nsFormatter(['common', 'phone-type'])
// US and Canada share the +1 calling code, so showing it doesn't distinguish between them -
// Mexico has its own distinct +52 and isn't included here.
const SHARED_CODE_COUNTRIES = new Set(['US', 'CA'])

export const PhoneNumbers = ({ edit, ...props }: PhoneNumbersProps) =>
	edit ? <PhoneNumbersEdit {...props} /> : <PhoneNumbersDisplay {...props} />

const PhoneNumbersDisplay = ({ parentId = '', passedData, direct, locationOnly }: PhoneNumbersProps) => {
	const output: ReactElement[] = []
	const slug = useSlug()
	const { isEditMode } = useEditMode()
	const { data: org } = api.organization.forOrgPage.useQuery({ slug })
	const { t } = useTranslation(formatNs(org?.id))
	const variants = useCustomVariant()
	const { data } = api.orgPhone.forContactInfo.useQuery(
		{ parentId, locationOnly },
		{ enabled: !passedData, select: (data) => data?.map((res) => ({ ...res, active: undefined })) }
	)

	const componentData = passedData ?? data
	const handleTrackClick = useCallback(
		(url: string) => () => {
			productEvent.outboundClick('phone', url, org?.name ?? 'unknown')
		},
		[org?.name]
	)

	const getDescription = useCallback(
		(description: FreeTextItem | null, phoneType: FreeTextItem | null) => {
			if (description && org) {
				return t(description.key, { ns: org.id, defaultValue: description.defaultText })
			}
			if (phoneType) {
				return t(phoneType.key, { ns: 'phone-type' })
			}
			return null
		},
		[org, t]
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
		const phoneNumber = SHARED_CODE_COUNTRIES.has(country)
			? parsedPhone.formatNational()
			: parsedPhone.formatInternational()
		const desc = getDescription(description, phoneType)

		const item = isEditMode ? (
			<AttributeEditWrapper key={phone.id} id={phone.id} active={phone.active ?? false}>
				<Stack gap={4}>
					{isExternal(dialURL) ? (
						<Link
							external
							href={dialURL}
							variant={variants.Link.inlineInverted}
							onClick={handleTrackClick(dialURL)}
						>
							{phoneNumber}
						</Link>
					) : (
						<Text>{phoneNumber}</Text>
					)}
					{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
				</Stack>
			</AttributeEditWrapper>
		) : (
			<Stack gap={4} key={phone.id}>
				{isExternal(dialURL) ? (
					<Link
						external
						href={dialURL}
						variant={variants.Link.inlineInverted}
						onClick={handleTrackClick(dialURL)}
					>
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
		<Stack gap={12}>
			<Title order={3}>{t(direct ? 'direct.phone' : 'words.phone')}</Title>
			{output}
		</Stack>
	)
}

const PhoneNumbersEdit = ({ parentId = '' }: PhoneNumbersProps) => {
	const theme = useMantineTheme()
	const variants = useCustomVariant()
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
		onSuccess: async (_data, variables) => {
			// Same story as PhoneDrawer's own cache-patching (see its `patchContactListCaches`):
			// invalidating this list and letting it refetch is racy against the API's caching layer
			// and can silently keep showing the pre-link list with no indication anything happened.
			// Fetching the newly-linked phone's own record and inserting it into the list cache
			// directly sidesteps that. `phoneType` isn't available from that query, so it's left
			// `null` here - a real refetch (still triggered below, just not blocking this one) fills
			// it in on next natural load if it was actually set.
			const linked = await apiUtils.orgPhone.forEditDrawer.fetch({
				id: variables.orgPhoneId,
				orgId: orgId?.id ?? '',
			})
			if (linked) {
				apiUtils.orgPhone.forContactInfoEdit.setData({ parentId }, (old) => {
					if (!old || old.some((item) => item.id === linked.id)) {
						return old
					}
					const next = [
						...old,
						{
							id: linked.id,
							number: linked.number,
							ext: linked.ext,
							country: linked.country,
							primary: linked.primary,
							description: linked.description ? { key: '', defaultText: linked.description } : null,
							phoneType: null,
							locationOnly: linked.locationOnly,
							published: linked.published,
							deleted: linked.deleted,
						},
					]
					return next.toSorted(
						(a, b) => Number(b.published) - Number(a.published) || Number(a.deleted) - Number(b.deleted)
					)
				})
			}
			apiUtils.orgPhone.forContactInfoEdit.invalidate({ parentId }, { refetchType: 'none' })
		},
	})
	// A single shared drawer instance for this whole section, rather than one PhoneDrawer per row
	// plus another nested inside the "Create new" Menu item - that composition (a Drawer mounted
	// for the entirety of a Menu.Item's life) desynced Mantine's Menu/Drawer interaction badly
	// enough to both strand drawers open after save and swallow focus from every field inside a
	// create-new session. Rows and the "Create new" trigger now just set which phone (if any) this
	// one drawer should show.
	const [editingPhone, setEditingPhone] = useState<{ id: string; createNew: boolean } | null>(null)
	const handleEditExisting = useCallback((id: string) => () => setEditingPhone({ id, createNew: false }), [])
	const handleCreateNew = useCallback(
		() => setEditingPhone({ id: generateId('orgPhone'), createNew: true }),
		[]
	)
	const handleDrawerClose = useCallback(() => setEditingPhone(null), [])
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
		const phoneNumber = SHARED_CODE_COUNTRIES.has(country)
			? parsedPhone.formatNational()
			: parsedPhone.formatInternational()

		const desc = getDescription(description, phoneType)

		const renderItem = () => {
			switch (true) {
				case phone.deleted: {
					return {
						number: (
							<Group gap={4} wrap='nowrap'>
								<Text variant={variants.Text.darkGrayStrikethru}>{phoneNumber}</Text>
							</Group>
						),
						desc: desc ? <Text variant={variants.Text.utility4darkGrayStrikethru}>{desc}</Text> : null,
					}
				}
				case !phone.published: {
					return {
						number: (
							<Group gap={4} wrap='nowrap'>
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
			<Stack gap={4} key={phone.id}>
				<Link variant={variants.Link.inlineInverted} onClick={handleEditExisting(phone.id)}>
					{itemDisplay.number}
				</Link>
				{itemDisplay.desc}
			</Stack>
		)
		return item
	})

	const addOrLink = isLocation ? (
		<Menu keepMounted withinPortal>
			<Menu.Target>
				<Link variant={variants.Link.inlineInverted}>
					<Group wrap='nowrap' gap={4}>
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
							<Group wrap='nowrap'>
								<Icon icon='carbon:link' />
								<Stack gap={0}>
									<Text variant={phoneTextVariant}>{number}</Text>
									{Boolean(phoneType) && <Text variant={descTextVariant}>{phoneType}</Text>}
									<Text variant={descTextVariant}>{description}</Text>
								</Stack>
							</Group>
						</Menu.Item>
					)
				})}
				<Menu.Divider />
				<Menu.Item key='new' onClick={handleCreateNew}>
					<Group wrap='nowrap'>
						<Icon icon='carbon:add-alt' />
						<Text variant={variants.Text.utility3}>Create new</Text>
					</Group>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	) : (
		<Link variant={variants.Link.inlineInverted} onClick={handleCreateNew}>
			<Group wrap='nowrap'>
				<Icon icon='carbon:add' />
				<Text variant={variants.Text.utility3}>Create new</Text>
			</Group>
		</Link>
	)

	return (
		<Stack gap={12}>
			<Title order={3}>{t('words.phone')}</Title>
			<Stack gap={12} className={classes.overlay}>
				{output}
				<Stack gap={4}>{addOrLink}</Stack>
			</Stack>
			<PhoneDrawer
				opened={editingPhone !== null}
				onClose={handleDrawerClose}
				id={editingPhone?.id}
				createNew={editingPhone?.createNew}
			/>
		</Stack>
	)
}

type FreeTextItem = {
	key: string
	defaultText: string
}
