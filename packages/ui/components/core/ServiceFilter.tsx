import { Accordion, Button, Checkbox, createStyles, Group, Menu, Text, useMantineTheme } from '@mantine/core'
import { useListState, randomId } from '@mantine/hooks'
import { background } from '@storybook/theming'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { Icon } from '../../icon'

const useStyles = createStyles((theme) => ({
	button: {
		borderRadius: '8px',
		borderColor: theme.other.colors.tertiary.coolGray,
		background: theme.other.colors.secondary.white,
		'&:hover': {
			background: theme.other.colors.primary.lightGray,
		},
		color: theme.other.colors.secondary.black,
		':root': {
			display: 'flex',
			justifyContent: 'space-between',
			width: '600px',
		},
	},
	container: {
		width: '600px',
	},
}))

const initialValues = [
	{ label: 'service thing 1', checked: false, key: randomId() },
	{ label: 'service thing 2', checked: false, key: randomId() },
	{ label: 'service thing 3', checked: false, key: randomId() },
]

export const ServiceFilter = ({}: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const [opened, setOpened] = useState(false)

	const [values, handlers] = useListState(initialValues)

	const allChecked = values.every((value) => value.checked)
	const indeterminate = values.some((value) => value.checked) && !allChecked

	const items = values.map((value, index) => (
		<Checkbox
			mt='xs'
			ml={33}
			label={value.label}
			key={value.key}
			checked={value.checked}
			onChange={(event) => handlers.setItemProp(index, 'checked', event.currentTarget.checked)}
		/>
	))

	return (
		<Menu width={600}>
			<Menu.Target>
				<Button
					className={classes.button}
					styles={{ root: { width: '600px' }, inner: { display: 'flex', justifyContent: 'space-between' } }}
					rightIcon={<Icon icon='carbon:chevron-down' />}
				>
					<Text>Services</Text>
					<Text>2</Text>
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item>
					<Accordion>
						<Accordion.Item value='customization'>
							<Accordion.Control>
								<Checkbox
									checked={allChecked}
									indeterminate={indeterminate}
									label='Receive all notifications'
									transitionDuration={0}
									onChange={() =>
										handlers.setState((current) =>
											current.map((value) => ({ ...value, checked: !allChecked }))
										)
									}
								/>
								{items}
							</Accordion.Control>
							<Accordion.Panel>{items}</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value='flexibility'>
							<Accordion.Control>Flexibility</Accordion.Control>
							<Accordion.Panel>
								Configure components appearance and behavior with vast amount of settings or overwrite any
								part
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value='focus-ring'>
							<Accordion.Control>No annoying focus ring</Accordion.Control>
							<Accordion.Panel>
								With new :focus-visible pseudo-class focus ring appears only when user navigates with keyboard
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				</Menu.Item>
				{/* <Menu.Item>Thing 2</Menu.Item>
				<Menu.Item>Thing 3</Menu.Item>
				<Menu.Item>Thing 4</Menu.Item> */}
			</Menu.Dropdown>
		</Menu>
	)
}

type Props = {}

// ;<Accordion>
// 	<Accordion.Item value='customization'>
// 		<Accordion.Control>Customization</Accordion.Control>
// 		<Accordion.Panel>
// 			Colors, fonts, shadows and many other parts are customizable to fit your design needs
// 		</Accordion.Panel>
// 	</Accordion.Item>

// 	<Accordion.Item value='flexibility'>
// 		<Accordion.Control>Flexibility</Accordion.Control>
// 		<Accordion.Panel>
// 			Configure components appearance and behavior with vast amount of settings or overwrite any part
// 			of component styles
// 		</Accordion.Panel>
// 	</Accordion.Item>

// 	<Accordion.Item value='focus-ring'>
// 		<Accordion.Control>No annoying focus ring</Accordion.Control>
// 		<Accordion.Panel>
// 			With new :focus-visible pseudo-class focus ring appears only when user navigates with keyboard
// 		</Accordion.Panel>
// 	</Accordion.Item>
// </Accordion>
