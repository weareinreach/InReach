import { Icon as Iconify, IconProps, IconifyIconProps } from '@iconify/react'
import { loadIcons } from 'icon/iconCollection'
import { SVGProps, RefAttributes } from 'react'
import { iconList } from './iconList'
interface CustomIconifyIconProps extends IconifyIconProps {
	icon: (typeof iconList)[number]
}
type IconElementProps = SVGProps<SVGSVGElement>

type CustomIconProps = IconElementProps & CustomIconifyIconProps & { ref?: RefAttributes<SVGSVGElement> }

export const Icon = (props: CustomIconProps) => {
	loadIcons()

	return <Iconify {...props} />
}
