import { createStyles, Group, rem, Space, useMantineTheme } from '@mantine/core'
import { useMediaQuery, useSetState, useViewportSize } from '@mantine/hooks'
import { type ComponentProps, useMemo, useRef } from 'react'
import { InView } from 'react-intersection-observer'
import { type ValueOf } from 'type-fest'

import { ActionButtons } from './ActionButtons'
import { Breadcrumb, type BreadcrumbProps } from './Breadcrumb'

const MIN_BUTTON_WIDTH = 55.2
const BREACRUMB_WIDTH = 162

const useStyles = createStyles(() => ({
	toolbar: {
		// padding: `${rem(0)} ${rem(8)} ${rem(0)} ${rem(12)}`,
		marginLeft: rem(-8),
		maxWidth: '100%',
		overflow: 'hidden',
	},
}))

export const Toolbar = ({ saved = false, breadcrumbProps, hideBreadcrumb, ...ids }: Props) => {
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const { width } = useViewportSize()
	const { classes } = useStyles()
	const buttonMap = useMemo(
		() =>
			({
				review: ActionButtons.Review,
				share: ActionButtons.Share,
				save: ActionButtons.Save,
			}) as const,
		[]
	)
	type ButtonOptions = keyof typeof buttonMap
	const buttons = useMemo(() => ['review', 'share', 'save'] as ButtonOptions[], [])
	const containerRef = useRef<HTMLDivElement>(null)

	const buttonsInViewPort = useMemo(
		() => (isMobile ? Math.ceil((width - BREACRUMB_WIDTH) / MIN_BUTTON_WIDTH) % 3 : 4),
		[width, isMobile]
	)
	const [visibility, setVisibility] = useSetState({ review: true, share: true, save: true })

	/* Contains the actionButtons displayed outside the 'more' actionButton menu */
	const inToolbar = useMemo(
		() => (buttonsInViewPort > 3 ? buttons : buttons.slice(-(buttonsInViewPort + 1))),
		[buttonsInViewPort, buttons]
	)

	const showMenu = useMemo(() => Object.values(visibility).includes(true), [visibility])
	console.log(showMenu, 'showMenu')
	const displayButtons = useMemo(
		() =>
			buttons.map((button) => {
				let ButtonComponent: ValueOf<typeof buttonMap>
				let props: ComponentProps<typeof ButtonComponent>
				switch (button) {
					case 'review': {
						ButtonComponent = buttonMap.review
						props = {
							omitLabel: isMobile,
						}
						break
					}
					case 'share': {
						ButtonComponent = buttonMap.share
						props = {
							omitLabel: isMobile,
						}
						break
					}
					case 'save': {
						ButtonComponent = buttonMap.save
						props = {
							itemId: ids.serviceId ?? ids.organizationId,
							itemName: breadcrumbProps.backToText ?? '',
							omitLabel: isMobile,
						}
						break
					}
				}
				return (
					<InView key={button} threshold={1}>
						{({ inView, ref }) => {
							setVisibility({ [button]: inView })
							return <ButtonComponent ref={ref} style={{ opacity: visibility[button] ? 1 : 0 }} {...props} />
						}}
					</InView>
				)
			}),
		[
			buttons,
			isMobile,
			ids.serviceId,
			ids.organizationId,
			breadcrumbProps.backToText,
			setVisibility,
			visibility,
		]
	)

	return (
		<Group position='apart' align='center' w='100%' noWrap className={classes.toolbar} ref={containerRef}>
			{hideBreadcrumb ? <Space w={1} /> : <Breadcrumb {...breadcrumbProps} />}
			<Group spacing={0} noWrap>
				{displayButtons}
			</Group>

			{/* <ActionButtons iconKey='more' outsideMoreMenu={inToolbar} {...ids} /> */}
		</Group>
	)
}

type Props = {
	saved: boolean
	breadcrumbProps: BreadcrumbProps
	organizationId: string
	serviceId?: string
	hideBreadcrumb?: boolean
}
