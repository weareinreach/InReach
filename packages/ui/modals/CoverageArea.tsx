import {
	ActionIcon,
	Badge,
	Box,
	Button,
	ButtonProps,
	Checkbox,
	CloseButton,
	Divider,
	Group,
	Modal,
	Grid,
	Select,
	Stack,
	Tabs,
	Title,
	Text,
	createPolymorphicComponent,
	createStyles,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { useState, forwardRef } from 'react'

import { Icon } from 'icon'

import { ModalTitle } from './ModalTitle'

const useStyles = createStyles((theme) => ({
	borderedBox: {
		padding: 20,
		border: `1px solid ${theme.other.colors.tertiary.coolGray}`,
		borderRadius: 8,
	},
	locationBadge: {
		padding: '0px 12px',
		borderColor: `${theme.other.colors.tertiary.coolGray}`,
		'& *, & .mantine-Text-root': {
			...theme.other.utilityFonts.utility1,
		},
	},
	noHoverHighlight: {
		'&:hover': { backgroundColor: 'inherit' },
	},
	ModalContent: {
		'& > *': { width: '100%' },
	},
	selectSectionWrapper: {
		'& .mantine-Select-input, & .mantine-Select-input::-webkit-input-placeholder': {
			...theme.other.utilityFonts.utility1,
			margin: 0,
		},
		'& *': {
			...theme.other.utilityFonts.utility1,
		},
		'& .mantine-Select-rightSection': {
			justifyContent: 'end',
		},
	},
}))

const MOCK_SELECT_VALUES = ['One', 'Two', 'Three']

const CoverageAreaModal = forwardRef<HTMLButtonElement, Props>((props, ref) => {
	const { orgName, orgLocations, ...rest } = props
	const { classes } = useStyles()
	const { t } = useTranslation()
	const [opened, { open, close }] = useDisclosure()
	const [activeTab, setActiveTab] = useState<string | null>('united-states')
	// const form = useFormContext()

	const LocationSelect = ({ placeholder, data /*, inputPropsName*/ }: SelectFieldProps) => {
		// Display close button when field is not empty
		// const displayClose = form.getInputProps(inputPropsName).value.length > 0
		const rightSection = (
			<Group noWrap spacing={5} position='right'>
				{
					//displayClose && (
					<>
						<ActionIcon
							onClick={() => console.log('clicked')}
							variant='transparent'
							style={{ pointerEvents: 'all' }}
						>
							<Icon width={24} icon='carbon:close' />
						</ActionIcon>
						<Divider orientation='vertical' />
					</>
					/*)*/
				}
				<Icon width={24} icon='carbon:chevron-down' />
			</Group>
		)

		// Disable Select fields unless it's the state select field, or the state field has a value
		// const disabled = inputPropsName.includes('state) || form.getInputProps('state').value.length === 0

		return (
			<Select
				rightSectionWidth={64}
				rightSection={rightSection}
				styles={{ rightSection: { pointerEvents: 'none' } }}
				placeholder={placeholder as string}
				data={data}
				//disabled={disabled}
				//form.getInputProps(inputPropsName)
			/>
		)
	}

	const locationChips = orgLocations.map((location) => (
		<Badge key={location} variant='outline' className={classes.locationBadge}>
			<Group spacing={8} align='center' noWrap>
				<Text>{location}</Text>
				<CloseButton variant='transparent' onClick={() => console.log('Delete: ', location)} />
			</Group>
		</Badge>
	))

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
							{`${t('organization')}: ${orgName}`}
						</Text>
					</Stack>
					<Tabs value={activeTab} onTabChange={setActiveTab}>
						<Tabs.List grow>
							<Tabs.Tab value='united-states'>{t('united-states')}</Tabs.Tab>
							<Tabs.Tab value='canada'>{t('canada')}</Tabs.Tab>
							<Tabs.Tab value='mexico'>{t('mexico')}</Tabs.Tab>
						</Tabs.List>
					</Tabs>
					<Stack spacing={16} className={classes.borderedBox}>
						<Checkbox
							className={classes.noHoverHighlight}
							label={t('can-help-people-in', { location: t(activeTab as string) })}
						/>
						<Group spacing={12}>{locationChips}</Group>
					</Stack>
					<Stack spacing={16}>
						<Text sx={(theme) => theme.other.utilityFonts.utility1}>{t('add-coverage-area')}</Text>
						<Grid gutter='xl' gutterXl='xl'>
							<Grid.Col xs={9} sm={9}>
								<Stack className={classes.selectSectionWrapper}>
									<LocationSelect placeholder={t('select-state') as string} data={MOCK_SELECT_VALUES} />
									<LocationSelect placeholder={t('select-country') as string} data={MOCK_SELECT_VALUES} />
									<LocationSelect placeholder={t('select-city') as string} data={MOCK_SELECT_VALUES} />
								</Stack>
							</Grid.Col>
							<Grid.Col xs={3} sm={3}>
								<Button px={32} py={6} h={40}>
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
			<Box ref={ref} component={'button'} onClick={open} {...rest} />
		</>
	)
})

CoverageAreaModal.displayName = 'coverageArea'

export const CoverageArea = createPolymorphicComponent<HTMLButtonElement, Props>(CoverageAreaModal)

type Props = {
	orgName: string
	orgLocations: string[]
} & ButtonProps

type SelectFieldProps = {
	placeholder: string
	data: string[]
	// inputPropsName: string
}
