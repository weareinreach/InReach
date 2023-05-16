import { Icon as Iconify, type IconifyIconProps } from '@iconify/react'
import { createStyles } from '@mantine/core'
import { type RefAttributes, type SVGProps } from 'react'
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

export const Icon = ({ icon, block, className, ...props }: CustomIconProps) => {
	const { classes, cx } = useStyles({ block })
	return <Iconify icon={validateIcon(icon)} className={cx(classes.root, className)} {...props} />
}
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

type CustomIconProps = IconElementProps & CustomIconifyIconProps & { ref?: RefAttributes<SVGSVGElement> }
