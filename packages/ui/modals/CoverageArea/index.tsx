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
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import { forwardRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ServiceAreaForm, type ZServiceAreaForm } from './schema'
import { useStyles } from './styles'
import { ModalTitle } from '../ModalTitle'

const CoverageAreaModal = forwardRef<HTMLButtonElement, Props>(({ id, ...props }, ref) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation(['common', 'gov-dist'])
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const [opened, { open, close }] = useDisclosure(true) //TODO: remove `true` when done with dev

	const [selected, setSelected] = useState<SelectionState>({ country: null, govDist: null, subDist: null })
	const setVal = {
		country: (value: string) => setSelected({ country: value, govDist: null, subDist: null }),
		govDist: (value: string) => setSelected((prev) => ({ ...prev, govDist: value, subDist: null })),
		subDist: (value: string) => setSelected((prev) => ({ ...prev, subDist: value })),
		blank: () => setSelected({ country: null, govDist: null, subDist: null }),
	}

	const { data: dataServiceArea } = api.serviceArea.getServiceArea.useQuery(id)
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

	console.log(serviceAreaCountries, serviceAreaDistricts)

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
					[...serviceAreaDistricts, { id: valToAdd.value, tsKey: valToAdd.tsKey, tsNs: valToAdd.tsNs }],
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

	// const LocationSelect = ({ placeholder, data /*, inputPropsName*/ }: SelectFieldProps) => {
	// 	// Display close button when field is not empty
	// 	// const displayClose = form.getInputProps(inputPropsName).value.length > 0
	// 	const rightSection = (
	// 		<Group noWrap spacing={5} position='right'>
	// 			{
	// 				//displayClose && (
	// 				<>
	// 					<ActionIcon
	// 						onClick={() => console.log('clicked')}
	// 						variant='transparent'
	// 						style={{ pointerEvents: 'all' }}
	// 					>
	// 						<Icon width={24} icon='carbon:close' />
	// 					</ActionIcon>
	// 					<Divider orientation='vertical' />
	// 				</>
	// 				/*)*/
	// 			}
	// 			<Icon width={24} icon='carbon:chevron-down' />
	// 		</Group>
	// 	)

	// 	// Disable Select fields unless it's the state select field, or the state field has a value
	// 	// const disabled = inputPropsName.includes('state) || form.getInputProps('state').value.length === 0

	// 	return (
	// 		<Select
	// 			rightSectionWidth={64}
	// 			rightSection={rightSection}
	// 			styles={{ rightSection: { pointerEvents: 'none' } }}
	// 			placeholder={placeholder as string}
	// 			data={data}
	// 			//disabled={disabled}
	// 			//form.getInputProps(inputPropsName)
	// 		/>
	// 	)
	// }

	const activeAreas = compact(
		[
			serviceAreaCountries?.map((country) => (
				<Badge key={country.id} variant='outline' className={classes.locationBadge}>
					<Group spacing={8} align='center' noWrap>
						<Text>{countryTranslation.of(country.cca2)}</Text>
						<CloseButton variant='transparent' onClick={() => console.log('Delete: ', location)} />
					</Group>
				</Badge>
			)),

			// Display -> Country / District / Sub-District
			serviceAreaDistricts?.map((govDist) => (
				<Badge key={govDist.id} variant='outline' className={classes.locationBadge}>
					<Group spacing={8} align='center' noWrap>
						<Text>{t(govDist.tsKey, { ns: govDist.tsNs })}</Text>
						<CloseButton variant='transparent' onClick={() => console.log('Delete: ', location)} />
					</Group>
				</Badge>
			)),
		].flat()
	)

	return (
		<>
			<Modal
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: () => close() }} />}
				onClose={close}
				opened={opened}
			>
				<Stack spacing={24} className={classes.ModalContent} align='center'>
					<Stack align='center'>
						<Title order={2}>{t('coverage-area')}</Title>
						<Text sx={(theme) => ({ ...theme.other.utilityFonts.utility4, color: 'black' })}>
							{`${t('organization')}: `}
						</Text>
					</Stack>
					<Stack spacing={16}>
						<Group spacing={12}>{activeAreas}</Group>
					</Stack>
					<Stack spacing={16}>
						<Text sx={(theme) => theme.other.utilityFonts.utility1}>{t('add-coverage-area')}</Text>
						<Grid gutter='xl' gutterXl='xl'>
							<Grid.Col xs={9} sm={9}>
								<Stack className={classes.selectSectionWrapper}>
									<Select
										placeholder={t('select-country')}
										data={dataCountry ?? []}
										onChange={setVal.country}
									/>
									{selected.country && !!dataDistrict?.length && (
										<Select
											placeholder={t('select-next')}
											data={dataDistrict ?? []}
											onChange={setVal.govDist}
										/>
									)}
									{selected.govDist && !!dataSubDist?.length && (
										<Select
											placeholder={t('select-next')}
											data={dataSubDist ?? []}
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
					<Button size='lg' radius='md' type='submit' fullWidth>
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

type SelectFieldProps = {
	placeholder: string
	data: string[]
	// inputPropsName: string
}

type SelectionState = { country: string | null; govDist: string | null; subDist: string | null }
