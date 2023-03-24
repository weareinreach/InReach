import { addCollection } from '@iconify/react'
import { getIcons } from '@iconify/utils'

const { icons: carbonIcons } = require('@iconify-json/carbon')
const { icons: phIcons } = require('@iconify-json/ph')
const { icons: simpleIcons } = require('@iconify-json/simple-icons')

/**
 * Create icon collection
 *
 * It loads the icons from the `carbon-icons` package select icons from other packages
 */
export const loadIcons = () => {
	const iconsSimple = getIcons(simpleIcons, ['tiktok'])
	const iconsPh = getIcons(phIcons, ['map-pin-fill'])

	addCollection(carbonIcons)
	if (iconsSimple !== null) addCollection(iconsSimple)
	if (iconsPh !== null) addCollection(iconsPh)
}
