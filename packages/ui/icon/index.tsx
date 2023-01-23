import { Icon as Iconify, IconProps, IconifyIconProps } from '@iconify/react'
import { SVGProps, RefAttributes } from 'react'

import { loadIcons } from 'icon/iconCollection'

import { iconList } from './iconList'

export const Icon = (props: CustomIconProps) => {
	loadIcons()

	return <Iconify {...props} />
}

export type IconList = (typeof iconList)[number]
interface CustomIconifyIconProps extends IconifyIconProps {
	icon: IconList
}
type IconElementProps = SVGProps<SVGSVGElement>

type CustomIconProps = IconElementProps & CustomIconifyIconProps & { ref?: RefAttributes<SVGSVGElement> }
