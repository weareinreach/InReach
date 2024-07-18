import { Icon as Iconify, type IconifyIconHTMLElement, type IconifyIconProps } from '@iconify-icon/react'
import { createStyles } from '@mantine/core'
import { forwardRef, memo, type Ref, type SVGProps } from 'react'
import { type LiteralUnion } from 'type-fest'

import { iconList } from './iconList'

export const isValidIcon = (icon: unknown): icon is IconList =>
	typeof icon === 'string' && iconList.includes(icon as IconList)

export const validateIcon = (icon: unknown): IconList => {
	if (isValidIcon(icon)) {
		return icon
	}
	return 'carbon:unknown-filled'
}

const useStyles = createStyles((_theme, { block, color }: IconStylesParams) => ({
	root: {
		display: block ? 'block' : undefined,
		color,
	},
}))

export const Icon = memo(
	forwardRef<IconifyIconHTMLElement, CustomIconProps>(({ icon, block, className, color, ...props }, ref) => {
		const { classes, cx } = useStyles({ block, color })
		Iconify.displayName = 'Iconify'
		return (
			<Iconify
				ref={ref}
				icon={validateIcon(icon)}
				className={`${cx(classes.root, className)} iconify-icon-root`}
				{...props}
			/>
		)
	})
)

Icon.displayName = '@weareinreach/ui/icon'
export type IconList = (typeof iconList)[number]
interface IconStylesParams {
	/** Sets `display: 'block'` */
	block?: boolean
	color?: string
}
interface CustomIconifyIconProps extends IconifyIconProps, IconStylesParams {
	/** [Search available icons here](https://icon-sets.iconify.design/carbon/) */
	icon: LiteralUnion<IconList, string>
}
type IconElementProps = SVGProps<IconifyIconHTMLElement>

type CustomIconProps = IconElementProps & CustomIconifyIconProps & { ref?: Ref<IconifyIconHTMLElement> }
export { IconifyIconHTMLElement }
