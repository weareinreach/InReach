import { Flex, Group } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { useRouter } from 'next/router'

import { ActionButtons, Breadcrumb } from './'
import { actionButtonIcons } from './ActionButtons'

const MIN_BUTTON_WIDTH = 55.2
const BREACRUMB_WIDTH = 162
const SM_BREAKPOINT = 375
const LG_BREAKPOINT = 861

export const Toolbar = ({ saved = false }: Props) => {
	const { width } = useViewportSize()
	const router = useRouter()
	const buttons = ['review', 'share', saved ? 'saved' : 'save']

	const buttonsInViewPort =
		width > SM_BREAKPOINT ? 4 : Math.ceil((width - BREACRUMB_WIDTH) / MIN_BUTTON_WIDTH) % 3

	/* Contains the actionButtons displayed outside the 'more' actionButton menu */
	const inToolbar = buttonsInViewPort > 3 ? buttons : buttons.slice(-(buttonsInViewPort + 1))

	const displayButtons = inToolbar.map((button) => (
		<ActionButtons
			key={button}
			iconKey={button as keyof typeof actionButtonIcons}
			omitLabel={width <= LG_BREAKPOINT}
		/>
	))

	// If 'saved' do not display 'save' button and viceversa
	inToolbar.push(saved ? 'save' : 'saved')

	return (
		<Flex justify='space-between' align='center'>
			<Breadcrumb option='back' backTo='search' onClick={() => router.push('/search')} />
			<Group noWrap spacing='xs'>
				{displayButtons}
				<ActionButtons iconKey='more' outsideMoreMenu={inToolbar} />
			</Group>
		</Flex>
	)
}

type Props = {
	saved: boolean
}
