/* eslint-disable @typescript-eslint/no-var-requires */
import { addCollection } from '@iconify/react'
import { getIcons } from '@iconify/utils'

const { icons: carbonIcons } = require('@iconify-json/carbon')
const { icons: fluentIcons } = require('@iconify-json/fluent-mdl2')
const { icons: mdiIcons } = require('@iconify-json/mdi')
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
	const iconsMdi = getIcons(mdiIcons, ['map-marker', 'content-save'])
	const iconsFluent = getIcons(fluentIcons, ['remove-from-trash'])

	addCollection(carbonIcons)
	if (iconsSimple !== null) addCollection(iconsSimple)
	if (iconsPh !== null) addCollection(iconsPh)
	if (iconsMdi !== null) addCollection(iconsMdi)
	if (iconsFluent !== null) addCollection(iconsFluent)
}
