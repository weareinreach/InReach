import {Select, Group, Text} from '@mantine/core'
import {Icon} from '@iconify/react'
import {forwardRef, useCallback} from 'react'
import {InputProps, set, unset} from 'sanity/form'
const icons = [
	'500px',
	'500px-with-circle',
	'basecamp',
	'behance',
	'creative-cloud',
	'dribbble',
	'dribbble-with-circle',
	'dropbox',
	'evernote',
	'facebook',
	'facebook-with-circle',
	'flattr',
	'flickr',
	'flickr-with-circle',
	'foursquare',
	'github',
	'github-with-circle',
	'google',
	'google-drive',
	'google-hangouts',
	'google-with-circle',
	'grooveshark',
	'icloud',
	'instagram',
	'instagram-with-circle',
	'lastfm',
	'lastfm-with-circle',
	'linkedin',
	'linkedin-with-circle',
	'medium',
	'medium-with-circle',
	'mixi',
	'onedrive',
	'paypal',
	'picasa',
	'pinterest',
	'pinterest-with-circle',
	'qq',
	'qq-with-circle',
	'raft',
	'raft-with-circle',
	'rainbow',
	'rdio',
	'rdio-with-circle',
	'renren',
	'scribd',
	'sina-weibo',
	'skype',
	'skype-with-circle',
	'slideshare',
	'smashing',
	'soundcloud',
	'spotify',
	'spotify-with-circle',
	'stumbleupon',
	'stumbleupon-with-circle',
	'swarm',
	'tripadvisor',
	'tumblr',
	'tumblr-with-circle',
	'twitter',
	'twitter-with-circle',
	'vimeo',
	'vimeo-with-circle',
	'vine',
	'vine-with-circle',
	'vk',
	'vk-alternitive',
	'vk-with-circle',
	'xing',
	'xing-with-circle',
	'yelp',
	'youko',
	'youko-with-circle',
	'youtube',
	'youtube-with-circle',
]

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
	icon: string
	label: string
}

// eslint-disable-next-line react/display-name
const SelectItems = forwardRef<HTMLDivElement, ItemProps>(
	({icon, label, ...others}: ItemProps, ref) => (
		<div ref={ref} {...others}>
			<Group noWrap>
				<Icon icon={icon} />

				<div>
					<Text size="sm">{label}</Text>
				</div>
			</Group>
		</div>
	)
)

// type Props = {
// 	input: {
// 		name: string
// 		onBlur: () => void
// 		onChange: () => void
// 		onFocus: () => void
// 		value: string
// 	}
// }

export const SocialMediaIconSelect = (props: InputProps) => {
	const items = icons.map((item) => ({
		icon: `entypo-social:${item}`,
		label: item,
		value: `entypo-social:${item}`,
	}))
	const {onChange, value = '', elementProps} = props
	const handleChange = useCallback(
		(value: string | null) => onChange(value ? set(value) : unset()),
		[onChange]
	)
	return (
		<Select
			label="Select Icon"
			itemComponent={SelectItems}
			data={items}
			{...elementProps}
			onChange={handleChange}
		/>
	)
}
