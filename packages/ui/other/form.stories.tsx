import { Checkbox, Grid, Radio, Space, Stack, Switch, Textarea, TextInput, Title } from '@mantine/core'
import { type Meta } from '@storybook/react'
import { useState } from 'react'

import { StorybookGrid } from '~ui/layouts/BodyGrid'

const Display = () => {
	const [switchVal, setSwitchVal] = useState<string[]>(['On'])
	return (
		<>
			<Grid.Col>
				<Title order={2}>Checkbox</Title>
				<Checkbox.Group defaultValue={['3', '4']}>
					<Stack>
						<Checkbox value='1' checked={false} label='Default' />
						<Checkbox value='2' checked={false} indeterminate label='Indeterminate' />
						<Checkbox value='4' checked={true} label='Checked' />
						<Checkbox value='5' disabled label='Disabled' />
						<Checkbox value='6' disabled checked label='Disabled checked' />
						<Checkbox value='7' disabled indeterminate label='Disabled indeterminate' />
						<Checkbox value='8' label='Hovered' classNames={{ root: 'hover' }} />
					</Stack>
				</Checkbox.Group>
			</Grid.Col>

			<Grid.Col>
				<Title order={2}>Radio Buttons</Title>
				<Radio.Group value='selected'>
					<Stack>
						<Radio value='unselected' label='Unselected' />
						<Radio value='Disabled' label='Disabled' disabled />
						<Radio value='selected' label='Selected' />
						<Radio value='hover' label='Hovered' classNames={{ root: 'hover' }} />
					</Stack>
				</Radio.Group>
			</Grid.Col>
			<Grid.Col>
				<Title order={2}>Switch</Title>

				<Switch.Group value={switchVal} onChange={setSwitchVal}>
					<Stack>
						<Switch value='Off' label='Off' />
						<Switch value='Disabled' label='Disabled' disabled />
						<Switch value='On' label='On' />
						<Switch value='Hovered' label='Hovered' classNames={{ root: 'hover' }} />
					</Stack>
				</Switch.Group>
			</Grid.Col>
			<Grid.Col sm={6}>
				<Title order={2}>Textbox (Single line)</Title>

				<Stack>
					<TextInput
						label='Default'
						placeholder='Placeholder text'
						description='This is some description text'
					/>
					<TextInput
						label='Focused'
						placeholder='Placeholder text'
						classNames={{ root: 'focus' }}
						description='This is some description text'
					/>
					<TextInput
						label='Disabled'
						placeholder='Placeholder text'
						disabled
						description='This is some description text'
					/>
					<TextInput
						label='Error'
						placeholder='Placeholder text'
						description='This is some description text'
						error='This is some error message text'
					/>
				</Stack>
				<Space h='md' />
				{/* <Stack>
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
				</Stack> */}
			</Grid.Col>

			<Grid.Col sm={6}>
				<Title order={2}>Textbox (Multi-line)</Title>
				<Stack>
					<Textarea
						label='Default'
						placeholder='Placeholder text'
						description='This is some description text'
					/>
					<Textarea
						label='Focused'
						placeholder='Placeholder text'
						classNames={{ root: 'focus' }}
						description='This is some description text'
					/>
					<Textarea
						label='Disabled'
						placeholder='Placeholder text'
						disabled
						description='This is some description text'
					/>
					<Textarea
						label='Error'
						placeholder='Placeholder text'
						error='This is some error message text'
						description='This is some description text'
					/>
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
