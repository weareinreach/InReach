import { DefaultMantineColor, Tuple } from '@mantine/core'

/**
 * Color shades generated at: https://noeldelgado.github.io/shadowlord/
 *
 * Shade step was set to `15%` & used colors `+/- 75%` from base
 */

/** Names of custom colors */
type CustomColors =
	| 'inReachGreen'
	| 'inReachPrimaryRegular'
	| 'inReachPrimaryHover'
	| 'inReachPrimaryDisabled'
	| 'inReachSecondaryRegular'
	| 'inReachSecondaryHover'
	| 'inReachSecondaryDisabled'
	| 'inReachUtilitySuccess'
	| 'inReachUtilityError'
	| 'primaryText'

type DefineColors = Record<string, Tuple<string, 10>>

export const customColors = {
	/** InReach Green - `Index 5` */
	inReachGreen: [
		'#bff1db',
		'#99e8c5',
		'#73dfaf',
		'#4dd699',
		'#23ce83',
		'#00c56d' /* index 5 - Primary color */,
		'#00a75d',
		'#008a4c',
		'#006c3c',
		'#004f2c',
	],
	/** Normal State for primary CTA buttons. - `Index 5` */
	inReachPrimaryRegular: [
		'#f2d1d1',
		'#ebb5b5',
		'#e39a9a',
		'#db7e7e',
		'#d46363',
		'#cc4747' /* index 5 - Primary color */,
		'#ad3c3c',
		'#8f3232',
		'#702727',
		'#521c1c',
	],
	/** Hover State for primary CTA buttons - `Index 5` */
	inReachPrimaryHover: [
		'#e6c7c7',
		'#d6a5a5',
		'#c78484',
		'#b86262',
		'#a84141',
		'#991f1f' /* index 5 - Primary color */,
		'#821a1a',
		'#6b1616',
		'#541111',
		'#3d0c0c',
	],
	/** Disabled state for primary CTAs. - `Index 5` */
	inReachPrimaryDisabled: [
		'#fef6f6',
		'#fef1f1',
		'#fdeceb',
		'#fde7e6',
		'#fce1e0',
		'#fcdcdb' /* index 5 - Primary color */,
		'#d6bbba',
		'#b09a99',
		'#8b7978',
		'#655858',
	],
	/**
	 * Normal State for secondary CTAs.
	 *
	 * Background color for primary banners. - `Index 5`
	 */
	inReachSecondaryRegular: [
		'#d3dcec',
		'#b9c7e1',
		'#9fb2d5',
		'#859dca',
		'#6a88be',
		'#5073b3' /* index 5 - Primary color */,
		'#446298',
		'#38517d',
		'#2c3f62',
		'#202e48',
	],
	/**
	 * Hover State for secondary buttons.
	 *
	 * Indicates when a menu option is in focus/hover state. - `Index 5`
	 */
	inReachSecondaryHover: [
		'#cbd2df',
		'#abb7cc',
		'#8c9bb9',
		'#6c80a6',
		'#4d6593',
		'#2d4a80' /* index 5 - Primary color */,
		'#263f6d',
		'#1f345a',
		'#192946',
		'#121e33',
	],
	/**
	 * Disabled state for secondary CTAs.
	 *
	 * Indicates when a drop down menu is active. - `Index 5`
	 */
	inReachSecondaryDisabled: [
		'#f8fafc',
		'#f4f6fa',
		'#f0f3f8',
		'#ebf0f7',
		'#e7ecf5',
		'#e3e9f3' /* index 5 - Primary color */,
		'#c1c6cf',
		'#9fa3aa',
		'#7d8086',
		'#5b5d61',
	],
	/**
	 * Indicates when a user sucessfully completes an action. Text color on light background or background color
	 * with /base/white text.
	 *
	 * `Index 5`
	 */
	inReachUtilitySuccess: [
		'#bff0c6',
		'#99e7a3',
		'#73df81',
		'#4dd65e',
		'#26cd3c',
		'#00c419' /* index 5 - Primary color */,
		'#00a715',
		'#008912',
		'#006c0e',
		'#004e0a',
	],
	/**
	 * Indicates when a user encounteres an error when trying to complete an action. Text color on light
	 * background or background color with /base/white text.
	 *
	 * `Index 5`
	 */
	inReachUtilityError: [
		'#f8bfc6',
		'#f399a4',
		'#ef7382',
		'#ea4d60',
		'#e6263e',
		'#e1001c' /* index 5 - Primary color */,
		'#bf0018',
		'#9e0014',
		'#7c000f',
		'#5a000b',
	],
	/**
	 * Primary definition for text colors
	 *
	 * `Index 9` - Dark text for light mode.
	 *
	 * `Index 0` - White text for dark mode.
	 */
	primaryText: [
		'#ffffff' /* Primary text color for dark mode */,
		'#e6e6e6',
		'#cdcdce',
		'#b4b4b6',
		'#9a9b9d',
		'#818285',
		'#686a6c',
		'#4f5154',
		'#36383b',
		'#1d1f23' /* Primary text color for light mode */,
	],
} as DefineColors

/** Merge custom color names with Mantine's presets */
type ExtendedCustomColors = CustomColors | DefaultMantineColor
type CustomColorDefinitions = Record<ExtendedCustomColors, Tuple<string, 10>>

/** Global declaration to add custom colors */
declare module '@mantine/core' {
	export interface MantineThemeColorsOverride {
		colors: CustomColorDefinitions
	}
}
