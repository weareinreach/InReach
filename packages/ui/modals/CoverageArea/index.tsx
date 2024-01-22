import { zodResolver } from '@hookform/resolvers/zod'
import {
	Badge,
	Box,
	Button,
	type ButtonProps,
	CloseButton,
	createPolymorphicComponent,
	Grid,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { compareArrayVals } from 'crud-object-diff'
import compact from 'just-compact'
import { type TFunction, useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { useForm } from 'react-hook-form'

import { trpc as api } from '~ui/lib/trpcClient'

import { useServiceAreaSelections } from './hooks'
import { ServiceAreaForm, type ZServiceAreaForm } from './schema'
import { useStyles } from './styles'
import { ModalTitle } from '../ModalTitle'

const reduceDistType = (data: { tsNs: string; tsKey: string }[] | undefined, t: TFunction) => {
	if (!data) return ''
	const valueSet = data.reduce((prev, curr) => {
		const translated = t(curr.tsKey, { ns: curr.tsNs, count: 1 })
		prev.add(translated)
		return prev
	}, new Set<string>())
	return [...valueSet].sort().join('/')
}

const CoverageAreaModal = forwardRef<HTMLButtonElement, Props>(({ id, ...props }, ref) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation(['common', 'gov-dist'])
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const [opened, { open, close }] = useDisclosure(true) //TODO: remove `true` when done with dev

	const [selected, setVal] = useServiceAreaSelections()

	const { data: dataCountry } = api.fieldOpt.countries.useQuery(
		{ activeForOrgs: true },
		{
			select: (data) =>
				data.map(({ id, cca2 }) => ({ value: id, label: countryTranslation.of(cca2), cca2 })) ?? [],
			placeholderData: [],
		}
	)
	const { data: dataDistrict } = api.fieldOpt.govDists.useQuery(
		{ countryId: selected.country ?? '', parentsOnly: true },
		{
			enabled: selected.country !== null,
			select: (data) =>
				data?.map(({ id, tsKey, tsNs, ...rest }) => ({
					value: id,
					label: t(tsKey, { ns: tsNs }),
					tsKey,
					tsNs,
					parent: null,
					...rest,
				})) ?? [],
			placeholderData: [],
		}
	)
	const { data: dataSubDist } = api.fieldOpt.getSubDistricts.useQuery(selected.govDist ?? '', {
		enabled: selected.govDist !== null,
		select: (data) =>
			data?.map(({ id, tsKey, tsNs, ...rest }) => ({
				value: id,
				label: t(tsKey, { ns: tsNs }),
				tsKey,
				tsNs,
				...rest,
			})) ?? [],
		placeholderData: [],
	})
	const apiUtils = api.useUtils()

	const updateServiceArea = api.serviceArea.update.useMutation()

	const form = useForm<ZServiceAreaForm>({
		resolver: zodResolver(ServiceAreaForm),
		defaultValues: async () => {
			const data = await apiUtils.serviceArea.getServiceArea.fetch(id)
			const formatted = {
				id: data?.id ?? id,
				countries: data?.countries ?? [],
				districts: data?.districts ?? [],
			}
			return formatted
		},
	})

	const serviceAreaCountries = form.watch('countries')
	const serviceAreaDistricts = form.watch('districts')

	const placeHolders = {
		first: t('select.base', { item: 'Country' }),
		second: t('select.base', {
			item: reduceDistType(
				dataDistrict?.map(({ govDistType }) => govDistType),
				t
			),
		}),
		third: t('select.base', {
			item: reduceDistType(
				dataSubDist?.map(({ govDistType }) => govDistType),
				t
			),
		}),
	}

	const handleAdd = () => {
		switch (true) {
			case !!selected.subDist:
			case !!selected.govDist: {
				const itemId = selected.subDist ?? selected.govDist
				const valToAdd = selected.subDist
					? dataSubDist?.find(({ value }) => value === itemId)
					: dataDistrict?.find(({ value }) => value === itemId)
				if (!valToAdd) return
				form.setValue(
					'districts',
					[
						...serviceAreaDistricts,
						{
							id: valToAdd.value,
							tsKey: valToAdd.tsKey,
							tsNs: valToAdd.tsNs,
							parent: valToAdd.parent,
							country: valToAdd.country,
						},
					],
					{
						shouldValidate: true,
					}
				)
				setVal.blank()
				break
			}
			case !!selected.country: {
				const valToAdd = dataCountry?.find(({ value }) => value === selected.country)
				if (!valToAdd) return
				form.setValue('countries', [...serviceAreaCountries, { id: valToAdd?.value, cca2: valToAdd?.cca2 }], {
					shouldValidate: true,
				})
				setVal.blank()
				break
			}
		}
	}

	const activeAreas = compact(
		[
			serviceAreaCountries?.map((country) => (
				<Badge key={country.id} variant='outline' className={classes.locationBadge}>
					<Group spacing={8} align='center' noWrap>
						<Text>{countryTranslation.of(country.cca2)}</Text>
						<CloseButton
							variant='transparent'
							onClick={() =>
								form.setValue(
									'countries',
									serviceAreaCountries?.filter(({ id }) => id !== country.id)
								)
							}
						/>
					</Group>
				</Badge>
			)),

			// Display -> Country / District / Sub-District
			serviceAreaDistricts?.map((govDist) => {
				const { id, tsKey, tsNs, country, parent } = govDist

				const displayName = compact([
					country.cca2,
					parent ? t(parent.tsKey, { ns: parent.tsNs }) : null,
					t(tsKey, { ns: tsNs }),
				]).join(' → ')

				return (
					<Badge key={id} variant='outline' className={classes.locationBadge}>
						<Group spacing={8} align='center' noWrap>
							<Text>{displayName}</Text>
							<CloseButton
								variant='transparent'
								onClick={() =>
									form.setValue(
										'districts',
										serviceAreaDistricts?.filter(({ id }) => id !== govDist.id)
									)
								}
							/>
						</Group>
					</Badge>
				)
			}),
		].flat()
	)

	const handleSave = () => {
		const initialData = {
			id: form.formState.defaultValues?.id,
			countries: compact(form.formState.defaultValues?.countries?.map((country) => country?.id) ?? []),
			districts: compact(form.formState.defaultValues?.districts?.map((district) => district?.id) ?? []),
		}
		const data = form.getValues()
		const currentData = {
			id: data.id,
			countries: data.countries.map((country) => country.id),
			districts: data.districts.map((district) => district.id),
		}

		const changes = {
			id: data.id,
			countries: compareArrayVals([initialData.countries, currentData.countries]),
			districts: compareArrayVals([initialData.districts, currentData.districts]),
		}
		updateServiceArea.mutate(changes)
	}

	return (
		<>
			<Modal
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: close }} />}
				onClose={close}
				opened={opened}
			>
				<Stack spacing={24} className={classes.ModalContent} align='center'>
					<Stack align='center'>
						<Title order={2}>{t('portal-module.service-area')}</Title>
						<Text sx={(theme) => ({ ...theme.other.utilityFonts.utility4, color: 'black' })}>
							{`${t('organization')}: `}
						</Text>
					</Stack>
					<Stack spacing={16}>
						<Group spacing={12}>{activeAreas}</Group>
					</Stack>
					<Stack spacing={16}>
						<Text sx={(theme) => theme.other.utilityFonts.utility1}>
							{t('add', {
								item: '$t(portal-module.service-area)',
							})}
						</Text>
						<Grid gutter='xl' gutterXl='xl'>
							<Grid.Col xs={9} sm={9}>
								<Stack className={classes.selectSectionWrapper}>
									<Select
										placeholder={placeHolders.first}
										data={dataCountry ?? []}
										value={selected.country}
										onChange={setVal.country}
									/>
									{selected.country && !!dataDistrict?.length && (
										<Select
											placeholder={placeHolders.second}
											data={dataDistrict ?? []}
											value={selected.govDist}
											onChange={setVal.govDist}
										/>
									)}
									{selected.govDist && !!dataSubDist?.length && (
										<Select
											placeholder={placeHolders.third}
											data={dataSubDist ?? []}
											value={selected.subDist}
											onChange={setVal.subDist}
										/>
									)}
								</Stack>
							</Grid.Col>
							<Grid.Col xs={3} sm={3}>
								<Button px={32} py={6} h={40} onClick={handleAdd}>
									{t('add', { context: '' })}
								</Button>
							</Grid.Col>
						</Grid>
					</Stack>
					<Button size='lg' radius='md' type='submit' fullWidth onClick={handleSave}>
						{t('save-changes')}
					</Button>
				</Stack>
			</Modal>
			<Box ref={ref} component={'button'} onClick={open} {...props} />
		</>
	)
})

CoverageAreaModal.displayName = 'coverageArea'

export const CoverageArea = createPolymorphicComponent<HTMLButtonElement, Props>(CoverageAreaModal)

interface Props extends ButtonProps {
	id: string
}
