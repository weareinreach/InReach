import { Checkbox, Radio, Switch, TextInput, Textarea, Title, Grid, Group, Stack, Space } from '@mantine/core'
import { Meta } from '@storybook/react'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { StorybookGrid } from '~ui/components/layout'

import { Icon } from '../icon'

const Clear = () => {
	const { t } = useTranslation()

	return (
		<Group spacing={4}>
			{t('clear')}
			<Icon icon='carbon:close' height={20} />
		</Group>
	)
}

const Display = () => {
	const [switchVal, setSwitchVal] = useState<string[]>(['On'])
	return (
		<>
			<Grid.Col>
				<Title order={2}>Checkbox</Title>
				<Checkbox.Group orientation='vertical' defaultValue={['3', '4']}>
					<Checkbox value='1' checked={false} label='Default' />
					<Checkbox value='2' checked={false} indeterminate label='Indeterminate' />
					<Checkbox value='4' checked={true} label='Checked' />
					<Checkbox value='5' disabled label='Disabled' />
					<Checkbox value='6' disabled checked label='Disabled checked' />
					<Checkbox value='7' disabled indeterminate label='Disabled indeterminate' />
					<Checkbox value='8' label='Hovered' classNames={{ root: 'hover' }} />
				</Checkbox.Group>
			</Grid.Col>

			<Grid.Col>
				<Title order={2}>Radio Buttons</Title>
				<Radio.Group value='selected' orientation='vertical'>
					<Radio value='unselected' label='Unselected' />
					<Radio value='Disabled' label='Disabled' disabled />
					<Radio value='selected' label='Selected' />
					<Radio value='hover' label='Hovered' classNames={{ root: 'hover' }} />
				</Radio.Group>
			</Grid.Col>
			<Grid.Col>
				<Title order={2}>Switch</Title>

				<Switch.Group value={switchVal} onChange={setSwitchVal}>
					<Switch value='Off' label='Off' />
					<Switch value='Disabled' label='Disabled' disabled />
					<Switch value='On' label='On' />
					<Switch value='Hovered' label='Hovered' classNames={{ root: 'hover' }} />
				</Switch.Group>
			</Grid.Col>
			<Grid.Col sm={6}>
				<Title order={2}>Textbox (Single line)</Title>

				<Stack>
					<TextInput label='Default' placeholder='Placeholder text' />
					<TextInput label='Focused' placeholder='Placeholder text' classNames={{ root: 'focus' }} />
					<TextInput label='Disabled' placeholder='Placeholder text' disabled />
					<TextInput label='Error' error placeholder='Placeholder text' />
				</Stack>
				<Space h='md' />
				<Stack>
					<TextInput
						label='With icon'
						placeholder='Placeholder text'
						icon={<Icon icon='carbon:location-filled' height={20} />}
						rightSection={<Clear />}
						rightSectionWidth='fit-content'
					/>
					<TextInput
						label='With icon (focused)'
						placeholder='Placeholder text'
						classNames={{ root: 'focus' }}
						icon={<Icon icon='carbon:location-filled' height={20} />}
						rightSection={<Clear />}
						rightSectionWidth='fit-content'
					/>
					<TextInput
						label='With icon (disabled)'
						placeholder='Placeholder text'
						icon={<Icon icon='carbon:location-filled' height={20} />}
						rightSection={<Clear />}
						rightSectionWidth='fit-content'
						disabled
					/>
					<TextInput
						label='With icon (error)'
						placeholder='Placeholder text'
						error
						icon={<Icon icon='carbon:location-filled' height={20} />}
						rightSection={<Clear />}
						rightSectionWidth='fit-content'
					/>
				</Stack>
			</Grid.Col>

			<Grid.Col sm={6}>
				<Title order={2}>Textbox (Multi-line)</Title>
				<Stack spacing={0}>
					<Textarea label='Default' placeholder='Placeholder text' />
					<Textarea label='Focused' placeholder='Placeholder text' classNames={{ root: 'focus' }} />
					<Textarea label='Disabled' placeholder='Placeholder text' disabled />
					<Textarea label='Error' placeholder='Placeholder text' error />
				</Stack>
			</Grid.Col>
		</>
	)
}

export default {
	title: 'Design System/Basic Form Elements',
	component: Display,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=65%3A395&t=aq7Ftb2fZQg99CFc-4',
		},
		pseudo: {
			hover: '.hover',
			focus: '.focus',
		},
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof Display>

export const BasicFormElements = {}
