import { addCollection } from '@iconify/react'
import { getIcons } from '@iconify/utils'
import { icons as carbonIcons } from '@iconify-json/carbon'
import { icons as simpleIcons } from '@iconify-json/simple-icons'

/**
 * Create icon collection
 *
 * It loads the icons from the `carbon-icons` package select icons from other packages
 */
export const loadIcons = () => {
	const extraIcons = getIcons(simpleIcons, ['tiktok'])

	addCollection(carbonIcons)
	if (extraIcons !== null) addCollection(extraIcons)
}
