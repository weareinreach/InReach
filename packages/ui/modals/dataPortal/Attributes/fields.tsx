import { Group, Select as MantineSelect, Stack, Text } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ComponentPropsWithoutRef, forwardRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { NumberInput, Radio, Select, TextInput } from 'react-hook-form-mantine'

import { type ApiOutput } from '@weareinreach/api'
import { type FieldAttributes, FieldType } from '@weareinreach/db/zod_util/attributeSupplement'
import { Button } from '~ui/components/core/Button'
import { trpc as api } from '~ui/lib/trpcClient'

import { type FormSchema } from './schema'

const SuppBoolean = () => {
	const { control } = useFormContext<FormSchema>()
	return (
		<Radio.Group<FormSchema> name='boolean' control={control}>
			<Group>
				<Radio.Item value={true} label='True/Yes' />
				<Radio.Item value={false} label='False/No' />
			</Group>
		</Radio.Group>
	)
}

const SuppText = () => {
	const { control } = useFormContext<FormSchema>()
	return (
		<Stack>
			<TextInput label='Text' {...{ control, name: 'text' }} />
			{/* <Button onClick={handler}>{t('words.add', { ns: 'common' })}</Button> */}
		</Stack>
	)
}

const SuppData = ({ schema }: SuppDataProps) => {
	const { control } = useFormContext<FormSchema>()

	const renderField = (schema: FieldAttributes) => {
		const { type, name: dataKey, ...schemaProps } = schema
		const baseProps = {
			...schemaProps,
			name: `data.${dataKey}` as const,
			control,
		}
		switch (type) {
			case FieldType.text: {
				return <TextInput {...baseProps} />
			}
			case FieldType.select: {
				const { options } = schema
				return <Select {...baseProps} data={options} />
			}
			case FieldType.number: {
				return <NumberInput {...baseProps} type='number' />
			}
			case FieldType.currency: {
				return <NumberInput {...baseProps} type='number' />
			}
		}
	}

	return (
		<Stack>
			{schema.flatMap((schema) => {
				if (Array.isArray(schema)) {
					return <Group noWrap>{schema.map(renderField)}</Group>
				} else {
					return renderField(schema)
				}
			})}
		</Stack>
	)
}
interface SuppDataProps {
	// schema: LiteralUnion<DataSchema, string>
	schema: FieldAttributes[] | FieldAttributes[][]
}

const SuppLang = () => {
	const { control } = useFormContext<FormSchema>()
	const { data: listOptions } = api.fieldOpt.languages.useQuery(undefined, {
		select: (data) => data.map(({ id, languageName }) => ({ value: id, label: languageName })),
	})
	return (
		<Group>
			{listOptions && <Select data={listOptions} searchable name='languageId' {...{ control }} />}
			{/* <Button onClick={() => handler(form.values.supplement?.languageId)}>
				{t('words.add', { ns: 'common' })}
			</Button> */}
		</Group>
	)
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

const SuppGeo = ({ countryOnly }: SuppGeoProps) => {
	const { control, ...form } = useFormContext<FormSchema>()
	const { t } = useTranslation(['country', 'gov-dist'])
	// const [primaryList, setPrimaryList] = useState<GeoList[] | undefined>()
	const [secondaryList, setSecondaryList] = useState<GeoList['districts'] | undefined>()
	const [tertiaryList, setTertiaryList] = useState<
		NonNullable<GeoList['districts']>[number]['subDistricts'] | undefined
	>()
	const [primarySearch, onPrimarySearch] = useState<string | null>(null)
	const [secondarySearch, onSecondarySearch] = useState<string | null>(null)
	const [tertiarySearch, onTertiarySearch] = useState<string | null>(null)

	// const [finalValue, setFinalValue] = useState<string | null>(null)
	// const [fieldName, setFieldName] = useState<FieldPath<FormSchema> | undefined>(
	// 	countryOnly ? 'countryId' : undefined
	// )

	const { data: countryList, ...countries } = api.fieldOpt.countries.useQuery(undefined, {
		enabled: countryOnly ?? false,
		select: (data) => data.map(({ id, name, flag }) => ({ value: id, label: name, flag: flag ?? undefined })),
	})
	const { data: distByCountryList } = api.fieldOpt.govDistsByCountry.useQuery(undefined, {
		enabled: !countryOnly,
		select: (data) =>
			data.map(({ id, tsKey, tsNs, flag, govDist }) => ({
				value: id,
				label: t(tsKey, { ns: tsNs }),
				flag: flag ?? undefined,
				districts: govDist,
			})),
	})
	const primaryList = countryOnly ? countryList : distByCountryList

	// useEffect(() => {
	// 	if (form.values.supplement?.govDistId && secondaryList) {
	// 		const secondarySelected = secondaryList.find(({ id }) => id === form.values.supplement?.govDistId)
	// 		if (secondarySelected && secondarySelected.subDistricts.length) {
	// 			form.setFieldValue('supplement.subDistId', undefined)
	// 			onTertiarySearch('')
	// 			setTertiaryList(secondarySelected.subDistricts)
	// 		} else if (secondarySelected && !secondarySelected.subDistricts.length) {
	// 			setTertiaryList(undefined)
	// 		}
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [form.values.supplement?.govDistId])

	// useEffect(() => {
	// 	if (form.values.supplement?.countryId && !countryOnly && primaryList) {
	// 		const primarySelected = primaryList.find(({ value }) => value === form.values.supplement?.countryId)
	// 		if (primarySelected && primarySelected.districts?.length) {
	// 			setSecondaryList(primarySelected.districts)
	// 		} else if (primarySelected && !primarySelected.districts?.length) {
	// 			onSecondarySearch('')
	// 			setSecondaryList(undefined)
	// 		}
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [form.values.supplement?.countryId, countryOnly])

	if (!primaryList && !countries.isSuccess) return <>Loading...</>
	return (
		<Stack>
			{primaryList && (
				<MantineSelect
					data={primaryList}
					searchable
					searchValue={primarySearch ?? undefined}
					onSearchChange={onPrimarySearch}
					itemComponent={GeoItem}
					// control={control}
					name='countryId'
				/>
			)}
			{secondaryList && (
				<MantineSelect
					data={secondaryList.map(({ id, tsKey, tsNs }) => ({
						value: id,
						label: t(tsKey, { ns: tsNs }) satisfies string,
					}))}
					searchable
					searchValue={secondarySearch ?? undefined}
					onSearchChange={onSecondarySearch}
					itemComponent={GeoItem}
					// control={control}
					name='govDistId'
					// {...form.getInputProps('supplement.govDistId')}
				/>
			)}
			{tertiaryList && (
				<MantineSelect
					data={tertiaryList.map(({ id, tsKey, tsNs }) => ({
						value: id,
						label: t(tsKey, { ns: tsNs }) satisfies string,
					}))}
					searchable
					searchValue={tertiarySearch ?? undefined}
					onSearchChange={onTertiarySearch}
					itemComponent={GeoItem}
					// {...form.getInputProps('supplement.subDistId')}
				/>
			)}
			<Button
			// onClick={() => {
			// 	const { govDistId, countryId } = form.values.supplement ?? {}
			// 	handler(govDistId ? { govDistId } : { countryId })
			// }}
			>
				{t('words.add', { ns: 'common' })}
			</Button>
		</Stack>
	)
}
interface SuppGeoProps {
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
