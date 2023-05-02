import { Radio, Group, Stack, TextInput, Select, Text } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type MouseEventHandler, useEffect, useState, type ComponentPropsWithoutRef, forwardRef } from 'react'
import { type LiteralUnion, type TupleToUnion } from 'type-fest'
import { type ApiOutput } from '@weareinreach/api'

import { Button } from '~ui/components/core/Button'
import { trpc as api } from '~ui/lib/trpcClient'

import { useFormContext } from './context'

const SuppBoolean = ({ handler }: SuppBooleanProps) => {
	const form = useFormContext()

	return (
		<Radio.Group
			value={
				form.values.supplement?.boolean === undefined
					? undefined
					: form.values.supplement.boolean
					? 'true'
					: 'false'
			}
			onChange={handler}
		>
			<Group>
				<Radio value='true' label='True/Yes' />
				<Radio value='false' label='False/No' />
			</Group>
		</Radio.Group>
	)
}
interface SuppBooleanProps {
	handler: (value: string) => void
}

const SuppText = ({ handler }: SuppTextProps) => {
	const form = useFormContext()
	const { t } = useTranslation('common')
	return (
		<Stack>
			<TextInput {...form.getInputProps('supplement.text')} />
			<Button onClick={handler}>{t('words.add', { ns: 'common' })}</Button>
		</Stack>
	)
}
interface SuppTextProps {
	handler: MouseEventHandler<HTMLButtonElement>
}

const dataSchemas = ['numMinMaxOrRange', 'numRange', 'numMin', 'numMax', 'number'] as const
type DataSchema = TupleToUnion<typeof dataSchemas>

const isDataSchema = (schema: string): schema is DataSchema => dataSchemas.includes(schema as DataSchema)

const SuppData = ({ handler, schema }: SuppDataProps) => {
	const form = useFormContext()
	const { t } = useTranslation('common')
	if (!isDataSchema(schema)) throw new Error('Invalid schema')
	console.log('SuppData')
	useEffect(() => {
		if (!form.values.supplement?.data) {
			form.setFieldValue('supplement.data', {})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.supplement])
	const body = (() => {
		switch (schema) {
			case 'numMax':
			case 'numMin':
			case 'number': {
				const label = schema === 'numMax' ? 'Max' : schema === 'numMin' ? 'Min' : 'Amount'
				const key = schema === 'numMax' ? 'max' : schema === 'numMin' ? 'min' : 'number'
				return <TextInput label={label} {...form.getInputProps(`supplement.data.${key}`)} />
			}
			case 'numRange':
			case 'numMinMaxOrRange': {
				return (
					<Group>
						<TextInput w='25%' label='Min' {...form.getInputProps(`supplement.data.min`)} />
						<TextInput w='25%' label='Max' {...form.getInputProps(`supplement.data.max`)} />
					</Group>
				)
			}
		}
	})()

	return (
		<Group>
			{body}
			<Button onClick={() => handler(form.values.supplement?.data)}>
				{t('words.add', { ns: 'common' })}
			</Button>
		</Group>
	)
}
interface SuppDataProps {
	handler: (data?: object) => void //MouseEventHandler<HTMLButtonElement>
	schema: LiteralUnion<DataSchema, string>
}

const SuppLang = ({ handler }: SuppLangProps) => {
	const form = useFormContext()
	const { t } = useTranslation('common')
	const [listOptions, setListOptions] = useState<LangList[] | undefined>()
	api.fieldOpt.languages.useQuery(undefined, {
		onSuccess: (data) =>
			setListOptions(data.map(({ id, languageName }) => ({ value: id, label: languageName }))),
	})
	return (
		<Group>
			{listOptions && (
				<Select data={listOptions} searchable {...form.getInputProps('supplement.languageId')} />
			)}
			<Button onClick={() => handler(form.values.supplement?.languageId)}>
				{t('words.add', { ns: 'common' })}
			</Button>
		</Group>
	)
}

interface SuppLangProps {
	handler: (value?: string) => void
}
interface LangList {
	value: string
	label: string
}

const GeoItem = forwardRef<HTMLDivElement, GeoItemProps>(({ flag, label, ...props }, ref) => {
	return (
		<div ref={ref} {...props}>
			<Group>
				{flag}
				<Text>{label}</Text>
			</Group>
		</div>
	)
})
GeoItem.displayName = 'GeoItem'

const SuppGeo = ({ handler, countryOnly }: SuppGeoProps) => {
	const form = useFormContext()
	const { t } = useTranslation(['country', 'gov-dist'])
	const [primaryList, setPrimaryList] = useState<GeoList[] | undefined>()
	const [secondaryList, setSecondaryList] = useState<GeoList['districts'] | undefined>()
	const [tertiaryList, setTertiaryList] = useState<
		NonNullable<GeoList['districts']>[number]['subDistricts'] | undefined
	>()
	const [primarySearch, onPrimarySearch] = useState<string | undefined>()
	const [secondarySearch, onSecondarySearch] = useState<string | undefined>()
	const [tertiarySearch, onTertiarySearch] = useState<string | undefined>()
	const countries = api.fieldOpt.countries.useQuery(undefined, {
		enabled: Boolean(countryOnly),
		onSuccess: (data) =>
			setPrimaryList(data.map(({ id, name, flag }) => ({ value: id, label: name, flag: flag ?? undefined }))),
	})
	const govDists = api.fieldOpt.govDistsByCountry.useQuery(undefined, {
		enabled: !Boolean(countryOnly),
		onSuccess: (data) => {
			setPrimaryList(
				data.map(({ id, tsKey, tsNs, flag, govDist }) => ({
					value: id,
					label: t(tsKey, { ns: tsNs }),
					flag: flag ?? undefined,
					districts: govDist,
				}))
			)
		},
	})

	useEffect(() => {
		if (form.values.supplement?.govDistId && secondaryList) {
			const secondarySelected = secondaryList.find(({ id }) => id === form.values.supplement?.govDistId)
			if (secondarySelected && secondarySelected.subDistricts.length) {
				form.setFieldValue('supplement.subDistId', undefined)
				onTertiarySearch('')
				setTertiaryList(secondarySelected.subDistricts)
			} else if (secondarySelected && !secondarySelected.subDistricts.length) {
				setTertiaryList(undefined)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.supplement?.govDistId])

	useEffect(() => {
		if (form.values.supplement?.countryId && !countryOnly && primaryList) {
			const primarySelected = primaryList.find(({ value }) => value === form.values.supplement?.countryId)
			if (primarySelected && primarySelected.districts?.length) {
				setSecondaryList(primarySelected.districts)
			} else if (primarySelected && !primarySelected.districts?.length) {
				onSecondarySearch('')
				setSecondaryList(undefined)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.supplement?.countryId, countryOnly])

	if (!primaryList && !countries.isSuccess) return <>Loading...</>
	return (
		<Stack>
			{primaryList && (
				<Select
					data={primaryList}
					searchable
					searchValue={primarySearch}
					onSearchChange={onPrimarySearch}
					itemComponent={GeoItem}
					{...form.getInputProps('supplement.countryId')}
				/>
			)}
			{secondaryList && (
				<Select
					data={secondaryList.map(({ id, tsKey, tsNs }) => ({
						value: id,
						label: t(tsKey, { ns: tsNs }) satisfies string,
					}))}
					searchable
					searchValue={secondarySearch}
					onSearchChange={onSecondarySearch}
					itemComponent={GeoItem}
					{...form.getInputProps('supplement.govDistId')}
				/>
			)}
			{tertiaryList && (
				<Select
					data={tertiaryList.map(({ id, tsKey, tsNs }) => ({
						value: id,
						label: t(tsKey, { ns: tsNs }) satisfies string,
					}))}
					searchable
					searchValue={tertiarySearch}
					onSearchChange={onTertiarySearch}
					itemComponent={GeoItem}
					{...form.getInputProps('supplement.subDistId')}
				/>
			)}
			<Button
				onClick={() => {
					const { govDistId, countryId } = form.values.supplement ?? {}
					handler(govDistId ? { govDistId } : { countryId })
				}}
			>
				{t('words.add', { ns: 'common' })}
			</Button>
		</Stack>
	)
}
interface SuppGeoProps {
	handler: (value?: { govDistId?: string; countryId?: string }) => void
	countryOnly?: boolean
}

interface GeoList {
	value: string
	label: string
	flag?: string
	districts?: ApiOutput['fieldOpt']['govDistsByCountry'][number]['govDist']
}

interface GeoItemProps extends ComponentPropsWithoutRef<'div'>, GeoList {}

export const Supplement = {
	Text: SuppText,
	Boolean: SuppBoolean,
	Data: SuppData,
	Language: SuppLang,
	Geo: SuppGeo,
}
