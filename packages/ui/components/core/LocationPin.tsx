import { HoverCard, useMantineTheme, Text, Tooltip, Box } from '@mantine/core'

import { useFormattedAddressParts, UseFormattedAddressProps } from '~ui/hooks'
import { Icon } from '~ui/icon'

export const LocationPin = ({ tooltip, $hover }: LocationPinProps) => {
	const theme = useMantineTheme()
	const addressParts = useFormattedAddressParts(tooltip)

	const marker = <Icon icon='ph:map-pin-fill' height={40} color={theme.other.colors.secondary.cornflower} />
	// console.log($hover)
	// TODO: [IN-800] Show Location name & address on hover

	// if (addressParts && tooltip) {
	// 	return (
	// 		<HoverCard withinPortal>
	// 			<HoverCard.Target>{marker}</HoverCard.Target>
	// 			<HoverCard.Dropdown>
	// 				<Text>{tooltip.name}</Text>
	// 				{addressParts.map((part, idx) => (
	// 					<Text key={idx}>{part}</Text>
	// 				))}
	// 			</HoverCard.Dropdown>
	// 		</HoverCard>
	// 	)
	// }
	return marker
}

interface LocationPinProps {
	lat: number
	lng: number
	tooltip?: UseFormattedAddressProps
	$hover?: unknown
}
