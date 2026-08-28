import {
	Box,
	Button,
	type ButtonProps,
	type ComboboxData,
	createPolymorphicComponent,
	Modal,
	Select,
	Stack,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type TFunction, useTranslation } from 'next-i18next/pages'
import { type ElementType, forwardRef, useCallback, useEffect } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'

import { useServiceAreaSelections } from './hooks'
import classes from './styles.module.css'
import { ModalTitle } from '../ModalTitle'

const reduceDistType = (data: { tsNs: string; tsKey: string }[] | undefined, t: TFunction) => {
	if (!data) {
		return []
	}
	const valueSet = data.reduce((prev, curr) => {
		const translated = t(curr.tsKey, { ns: curr.tsNs, count: 1 })
		prev.add(translated)
		return prev
	}, new Set<string>())
	return [...valueSet].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

const CoverageAreaModal = forwardRef<HTMLButtonElement, Props>(
	({ serviceArea, onSuccessAction, component: Component, ...props }, ref) => {
		const { t, i18n } = useTranslation(['common', 'gov-dist'])
		const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
		const [modalOpened, modalHandler] = useDisclosure(false)

		const [selected, setVal] = useServiceAreaSelections()

		useEffect(() => {
			if (modalOpened === true) {
				setVal.blank()
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [modalOpened])

		const { data: dataCountry } = api.fieldOpt.countries.useQuery(
			{ activeForOrgs: true },
			{
				select: (data) =>
					data.map(({ id, cca2 }) => ({ value: id, label: countryTranslation.of(cca2) ?? cca2, cca2 })) ?? [],
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

		const placeHolders = {
			first: t('select.base', { item: 'Country' }),
			second: t('select.base', {
				item: reduceDistType(
					dataDistrict?.map(({ govDistType }) => govDistType),
					t
				).join('/'),
			}),
			third: t('select.base', {
				item: reduceDistType(
					dataSubDist?.map(({ govDistType }) => govDistType),
					t
				).join('/'),
			}),
		}

		const addServiceArea = api.serviceArea.addToArea.useMutation({
			onSuccess: (data) => {
				if (onSuccessAction instanceof Function) {
					onSuccessAction()
				}
				if (data?.result) {
					modalHandler.close()
				}
			},
		})

		const canAdd = !!selected.country
		const handleAdd = useCallback(() => {
			if (selected.govDist || selected.subDist) {
				const distToAdd = selected.subDist ?? selected.govDist
				if (!distToAdd) {
					throw new Error('Missing district')
				}
				addServiceArea.mutate({
					serviceArea,
					govDistId: distToAdd,
				})
			} else if (selected.country) {
				addServiceArea.mutate({ serviceArea, countryId: selected.country })
			}
		}, [addServiceArea, selected, serviceArea])

		const handleCountryChange = useCallback(
			(value: string | null) => {
				if (value) {
					setVal.country(value)
				}
			},
			[setVal]
		)

		const handleGovDistChange = useCallback(
			(value: string | null) => {
				if (value) {
					setVal.govDist(value)
				}
			},
			[setVal]
		)

		const handleSubDistChange = useCallback(
			(value: string | null) => {
				if (value) {
					setVal.subDist(value)
				}
			},
			[setVal]
		)

		return (
			<>
				<Modal
					title={<ModalTitle breadcrumb={{ option: 'close', onClick: modalHandler.close }} />}
					onClose={modalHandler.close}
					opened={modalOpened}
				>
					<Stack gap={24} className={classes.ModalContent} align='center'>
						<Stack align='center'>
							<Title order={2}>
								{t('add', {
									item: '$t(portal-module.service-area)',
								})}
							</Title>
						</Stack>
						<Stack gap={16}>
							<Stack className={classes.selectSectionWrapper}>
								<Select
									placeholder={placeHolders.first}
									data={(dataCountry ?? []) as ComboboxData}
									value={selected.country}
									onChange={handleCountryChange}
								/>
								{selected.country && !!dataDistrict?.length && (
									<Select
										placeholder={placeHolders.second}
										data={(dataDistrict ?? []) as ComboboxData}
										value={selected.govDist}
										onChange={handleGovDistChange}
									/>
								)}
								{selected.govDist && !!dataSubDist?.length && (
									<Select
										placeholder={placeHolders.third}
										data={(dataSubDist ?? []) as ComboboxData}
										value={selected.subDist}
										onChange={handleSubDistChange}
									/>
								)}
							</Stack>
						</Stack>
						<Button size='lg' radius='md' type='submit' fullWidth onClick={handleAdd} disabled={!canAdd}>
							{t('words.add')}
						</Button>
					</Stack>
				</Modal>
				{Component && typeof Component !== 'string' ? (
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					<Component ref={ref} onClick={modalHandler.open} {...(props as any)} />
				) : (
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					<Box component={(Component ?? 'button') as any} ref={ref} onClick={modalHandler.open} {...props} />
				)}
			</>
		)
	}
)

CoverageAreaModal.displayName = 'coverageArea'

export const CoverageArea = createPolymorphicComponent<'button', Props>(CoverageAreaModal)

interface Props extends ButtonProps {
	serviceArea: string | NewServiceArea
	onSuccessAction?: () => void
	component?: ElementType
}

type NewServiceArea = { organizationId: string } | { orgLocationId: string } | { orgServiceId: string }
