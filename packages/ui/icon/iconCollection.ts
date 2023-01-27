import { addCollection } from '@iconify/react'
import { getIcons } from '@iconify/utils'

const { icons: carbonIcons } = require('@iconify-json/carbon')
const { icons: simpleIcons } = require('@iconify-json/simple-icons')

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
