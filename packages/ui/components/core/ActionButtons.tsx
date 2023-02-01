import { Button, createStyles, Menu, Text, useMantineTheme } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { openModal, openConfirmModal } from '@mantine/modals'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { UserReviewSubmit } from './UserReviewSubmit'
import { Icon } from '../../icon'
import { trpc } from '../../lib/trpcClient'

export const actionButtonIcons = {
	delete: { icon: 'carbon:delete', labelKey: 'delete' },
	more: {
		icon: 'carbon:overflow-menu-horizontal',
		useMenu: true,
		menuItems: ['Save', 'Share', 'Print', 'Delete', 'Review'],
	},
	print: { icon: 'carbon:printer', labelKey: 'print' },
	review: { icon: 'carbon:star', labelKey: 'review' },
	save: {
		icon: 'carbon:favorite',
		labelKey: 'save',
		useMenu: true,
		menuItems: ['Create new list', 'List 1', 'List 2'],
	},
	share: { icon: 'carbon:share', labelKey: 'share' },
} as const

const useStyles = createStyles((theme) => ({
	button: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: '48px',
		height: '48px',
		padding: '12px',
		gap: '8px',
		backgroundColor: theme.other.colors.secondary.white,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	icon: {
		marginLeft: '5.5px',
	},
	text: {
		fontWeight: theme.other.fontWeight.semibold,
		marginLeft: '9.25px',
	},
	menu: {
		background: 'black',
		'&:button': {
			color: 'white',
		},
	},
}))

const actions = {
	delete: () => {
		console.log('clicked delete button')
		//onClick should open a "are you sure modal"
		//Yes - close modal, deletes the specified resource, display notification that 'blah was deleted'
		//No -  close modal
		openConfirmModal({
			title: 'Please confirm your action',
			children: (
				<Text size='sm'>
					This action is so important that you are required to confirm it with a modal. Please click one of
					these buttons to proceed.
				</Text>
			),
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onCancel: () => console.log('Cancel'),
			onConfirm: () => console.log('Confirmed'),
		})
	},
	more: () => {
		console.log('clicked more button')
		//onClick should open a menu and list the available actions
		//should this sub-menu show icon + label, just icon, or just label?
	},
	print: () => {
		window.print()
	},
	review: () => {
		console.log('clicked review button')
		openModal({
			title: 'Placeholder Text for Submit a Review Modal',
			children: <UserReviewSubmit avatarName={'placeholderName'} avatarUrl={'placeholderUrl'} />,
		})
	},
	save: () => {
		console.log('clicked save button')
		//onClick should open a menu,
		//menu should have at least one option 'Create new list'
		////open modal to provide a name for the new list
		//if user has other lists, show them below the Create new list option
		//once saved, display notification that 'blah was saved'
		//add temporary 'saved' message to lang json file
	},
	share: () => {
		console.log('clicked share button')
		//onClick should create a link from the current page and copy that link to the clipboard
		//once copied, display notification that 'blah was copied to clipboard'
		//add temporary 'copied' message to lang json file

		// https://nextjs.org/docs/api-reference/next/router
		// const { pathname } = useRouter()

		// const path = `${process.env.VERCEL_URL}/${pathname}`
		// // https://mantine.dev/hooks/use-clipboard/
		// const clipboard = useClipboard()
		// clipboard.copy(path)
	},
} as const

/** Used to display the action buttons when viewing an organization/location/service. */
export const ActionButtons = ({ iconKey }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]
	const handler = actions[iconKey]
	const menuThings = 'menuItems' in iconRender ? iconRender.menuItems : null
	console.log(menuThings)

	// createList.mutate({ name: 'new List' }, {
	// 	onSuccess: (data) => {
	// 	console.log('new list created')
	// 	},
	// 	onError: () => {
	// 		console.log('Oops, something went went')
	// 	}
	// })

	// const {data: savedLists, status} = trpc.savedList.getAll.useQuery(undefined,{enabled: iconKey === 'save'})

	// const saveList = trpc.savedList.saveOrg.useMutation()
	// const unSaveList = trpc.savedList.delOrg.useMutation()
	// const createList = trpc.savedList.create.useMutation()

	// const {data: newList, status: createStatus} = createList

	// unSaveList.mutate({listId, organizationId})

	// saveList.mutate({listId, organizationId})

	// const x = savedLists?.map((list)=> {list.})

	// trpc.organization.
	return (
		<>
			{'useMenu' in iconRender ? (
				<Menu position='bottom-start'>
					<Menu.Target>
						<Button className={classes.button} radius='md'>
							<Icon
								icon={iconRender.icon}
								color={theme.other.colors.secondary.black}
								className={'labelKey' in iconRender ? '' : classes.icon}
							/>
							{'labelKey' in iconRender && <Text className={classes.text}>{t(iconRender.labelKey)}</Text>}
						</Button>
					</Menu.Target>
					<Menu.Dropdown style={{ background: 'black' }}>
						{/* map of menu items based on action option */}
						{menuThings &&
							menuThings.map((option, index) => (
								<Menu.Item key={index} value={index} style={{ color: 'white' }}>
									{option}
								</Menu.Item>
							))}
					</Menu.Dropdown>
				</Menu>
			) : (
				<Button onClick={handler} className={classes.button} radius='md'>
					<Icon
						icon={iconRender.icon}
						color={theme.other.colors.secondary.black}
						className={'labelKey' in iconRender ? '' : classes.icon}
					/>
					{'labelKey' in iconRender && <Text className={classes.text}>{t(iconRender.labelKey)}</Text>}
				</Button>
			)}
		</>
	)
}

type Props = {
	/**
	 * The action button is created using an iconKey, which, depending on the value supplied, will display
	 * either an icon and a label or just an icon
	 */
	iconKey: keyof typeof actionButtonIcons
	overflowItems?: Array<Exclude<keyof typeof actionButtonIcons, 'more'>>
}
