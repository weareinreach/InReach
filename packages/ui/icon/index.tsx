import { Icon as Iconify, IconProps, IconifyIconProps } from '@iconify/react'
import { SVGProps, RefAttributes } from 'react'

import { iconList } from './iconList'

export const Icon = (props: CustomIconProps) => {
	return <Iconify {...props} />
}

export const isValidIcon = (icon: unknown): icon is IconList =>
	typeof icon === 'string' && iconList.includes(icon as IconList)

export type IconList = (typeof iconList)[number]
interface CustomIconifyIconProps extends IconifyIconProps {
	/** [Search available icons here](https://icon-sets.iconify.design/carbon/) */
	icon: IconList
}
type IconElementProps = SVGProps<SVGSVGElement>

type CustomIconProps = IconElementProps & CustomIconifyIconProps & { ref?: RefAttributes<SVGSVGElement> }
