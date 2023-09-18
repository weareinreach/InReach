import { Icon as Iconify, type IconifyIconProps, type IconProps } from '@iconify/react'
import { createStyles } from '@mantine/core'
import { forwardRef, type SVGProps } from 'react'
import { type LiteralUnion } from 'type-fest'

import { iconList } from './iconList'

export const isValidIcon = (icon: unknown): icon is IconList =>
	typeof icon === 'string' && iconList.includes(icon as IconList)

export const validateIcon = (icon: unknown): IconList => {
	if (isValidIcon(icon)) return icon
	return 'carbon:unknown-filled'
}

const useStyles = createStyles((theme, { block }: IconStylesParams) => ({
	root: {
		display: block ? 'block' : undefined,
	},
}))

export const Icon = forwardRef<IconProps['ref'], CustomIconProps>(
	({ icon, block, className, ...props }, ref) => {
		const { classes, cx } = useStyles({ block })
		return (
			<Iconify
				// @ts-expect-error Iconify doesn't like our ref...
				ref={ref}
				icon={validateIcon(icon)}
				className={cx(classes.root, className)}
				{...props}
			/>
		)
	}
)
Icon.displayName = '@weareinreach/ui/icon'
export type IconList = (typeof iconList)[number]
interface IconStylesParams {
	/** Sets `display: 'block'` */
	block?: boolean
}
interface CustomIconifyIconProps extends IconifyIconProps, IconStylesParams {
	/** [Search available icons here](https://icon-sets.iconify.design/carbon/) */
	icon: LiteralUnion<IconList, string>
}
type IconElementProps = SVGProps<SVGSVGElement>

type CustomIconProps = IconElementProps & CustomIconifyIconProps //& { ref?: RefAttributes<SVGSVGElement> }
