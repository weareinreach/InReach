import { Radio, Group, Stack, TextInput } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { MouseEventHandler } from 'react'
import { type LiteralUnion, type TupleToUnion } from 'type-fest'

import { Button } from '~ui/components/core/Button'

import { useFormContext } from './context'

export const SuppBoolean = ({ handler }: SuppBooleanProps) => {
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

export const SuppText = ({ handler }: SuppTextProps) => {
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

export const SuppData = ({ handler, schema }: SuppDataProps) => {
	const form = useFormContext()
	if (!isDataSchema(schema)) throw new Error('Invalid schema')
	console.log('SuppData')
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

	return <Group>{body}</Group>
}
interface SuppDataProps {
	handler: MouseEventHandler<HTMLButtonElement>
	schema: LiteralUnion<DataSchema, string>
}
