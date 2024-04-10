import {
	Box,
	Button,
	type ButtonProps,
	createPolymorphicComponent,
	Modal,
	Select,
	Stack,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type TFunction, useTranslation } from 'next-i18next'
import { forwardRef, useEffect } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'

import { useServiceAreaSelections } from './hooks'
import { useStyles } from './styles'
import { ModalTitle } from '../ModalTitle'

const reduceDistType = (data: { tsNs: string; tsKey: string }[] | undefined, t: TFunction) => {
	if (!data) return ''
	const valueSet = data.reduce((prev, curr) => {
		const translated = t(curr.tsKey, { ns: curr.tsNs, count: 1 })
		prev.add(translated)
		return prev
	}, new Set<string>())
	return [...valueSet].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

const CoverageAreaModal = forwardRef<HTMLButtonElement, Props>(
	({ serviceArea, onSuccessAction, ...props }, ref) => {
		const { classes } = useStyles()
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
					data.map(({ id, cca2 }) => ({ value: id, label: countryTranslation.of(cca2), cca2 })) ?? [],
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
				),
			}),
			third: t('select.base', {
				item: reduceDistType(
					dataSubDist?.map(({ govDistType }) => govDistType),
					t
				),
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
		const handleAdd = () => {
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
		}

		return (
			<>
				<Modal
					title={<ModalTitle breadcrumb={{ option: 'close', onClick: modalHandler.close }} />}
					onClose={modalHandler.close}
					opened={modalOpened}
				>
					<Stack spacing={24} className={classes.ModalContent} align='center'>
						<Stack align='center'>
							<Title order={2}>
								{t('add', {
									item: '$t(portal-module.service-area)',
								})}
							</Title>
						</Stack>
						<Stack spacing={16}>
							<Stack className={classes.selectSectionWrapper}>
								<Select
									placeholder={placeHolders.first}
									data={dataCountry ?? []}
									value={selected.country}
									onChange={setVal.country}
									withinPortal
								/>
								{selected.country && !!dataDistrict?.length && (
									<Select
										placeholder={placeHolders.second}
										data={dataDistrict ?? []}
										value={selected.govDist}
										onChange={setVal.govDist}
										withinPortal
									/>
								)}
								{selected.govDist && !!dataSubDist?.length && (
									<Select
										placeholder={placeHolders.third}
										data={dataSubDist ?? []}
										value={selected.subDist}
										onChange={setVal.subDist}
										withinPortal
									/>
								)}
							</Stack>
						</Stack>
						<Button size='lg' radius='md' type='submit' fullWidth onClick={handleAdd} disabled={!canAdd}>
							{t('words.add')}
						</Button>
					</Stack>
				</Modal>
				<Box ref={ref} component={'button'} onClick={modalHandler.open} {...props} />
			</>
		)
	}
)

CoverageAreaModal.displayName = 'coverageArea'

export const CoverageArea = createPolymorphicComponent<'button', Props>(CoverageAreaModal)

interface Props extends ButtonProps {
	serviceArea: string | NewServiceArea
	onSuccessAction?: () => void
}

type NewServiceArea = { organizationId: string } | { orgLocationId: string } | { orgServiceId: string }
