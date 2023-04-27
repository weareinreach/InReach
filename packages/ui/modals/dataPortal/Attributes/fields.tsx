import { Radio, Group, Stack, TextInput } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { MouseEventHandler } from 'react'

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
