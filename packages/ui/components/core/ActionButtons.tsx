import { Button, createStyles, Menu, Text, useMantineTheme } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Icon } from '../../icon'
import { trpc } from '../../lib/trpcClient'

export const actionButtonIcons = {
	save: { icon: 'carbon:favorite', labelKey: 'save' },
	share: { icon: 'carbon:share', labelKey: 'share' },
	print: { icon: 'carbon:printer', labelKey: 'print' },
	delete: { icon: 'carbon:delete', labelKey: 'delete' },
	review: { icon: 'carbon:star', labelKey: 'review' },
	more: { icon: 'carbon:overflow-menu-horizontal' },
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
}))

const actions = {
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
	print: () => {
		window.print()
	},
	delete: () => {
		console.log('clicked delete button')
		//onClick should open a "are you sure modal"
		//Yes option closes modal, deletes the specified resource, display notification that 'blah was deleted'
		//No option closes modal
		//add temporary 'deleted' message to lang json file
	},
	review: () => {
		console.log('clicked review button')
		//onClick should open the Reviewer modal

		// https://mantine.dev/others/modals/
	},
	more: () => {
		console.log('clicked more button')
		//onClick should open a menu and list the above actions
		//should this sub-menu show icon + label, just icon, or just label?
	},
} as const

export const ActionButtons = ({ iconKey }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]
	const handler = actions[iconKey]

	// const {data: savedLists, status} = trpc.savedList.getAll.useQuery(undefined,{enabled: iconKey === 'save'})

	// const saveList = trpc.savedList.saveOrg.useMutation()
	// const unSaveList = trpc.savedList.delOrg.useMutation()
	// const createList = trpc.savedList.create.useMutation()

	// createList.mutate({ name: 'new List' }, {
	// 	onSuccess: (data) => {
	// 	console.log('new list created')
	// 	},
	// 	onError: () => {
	// 		console.log('Oops, something went went')
	// 	}
	// })

	// const {data: newList, status: createStatus} = createList

	// unSaveList.mutate({listId, organizationId})

	// saveList.mutate({listId, organizationId})

	// const x = savedLists?.map((list)=> {list.})

	// trpc.organization.
	return (
		<Button onClick={handler} className={classes.button} radius='md'>
			<Icon
				icon={iconRender.icon}
				color={theme.other.colors.secondary.black}
				className={'labelKey' in iconRender ? '' : classes.icon}
			/>
			{'labelKey' in iconRender && <Text className={classes.text}>{t(iconRender.labelKey)}</Text>}
		</Button>
	)
}

type Props = {
	iconKey: keyof typeof actionButtonIcons
	overflowItems?: Array<Exclude<keyof typeof actionButtonIcons, 'more'>>
}
