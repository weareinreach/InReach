import { Icon as Iconify, IconProps, IconifyIconProps } from '@iconify/react'
import { SVGProps, RefAttributes } from 'react'
import { type LiteralUnion } from 'type-fest'

import { iconList } from './iconList'

export const isValidIcon = (icon: unknown): icon is IconList =>
	typeof icon === 'string' && iconList.includes(icon as IconList)

export const validateIcon = (icon: unknown): IconList => {
	if (isValidIcon(icon)) return icon
	return 'carbon:unknown-filled'
}

export const Icon = ({ icon, ...props }: CustomIconProps) => {
	return <Iconify icon={validateIcon(icon)} {...props} />
}
export type IconList = (typeof iconList)[number]
interface CustomIconifyIconProps extends IconifyIconProps {
	/** [Search available icons here](https://icon-sets.iconify.design/carbon/) */
	icon: LiteralUnion<IconList, string>
}
type IconElementProps = SVGProps<SVGSVGElement>

type CustomIconProps = IconElementProps & CustomIconifyIconProps & { ref?: RefAttributes<SVGSVGElement> }
