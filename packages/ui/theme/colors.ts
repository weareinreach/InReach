import { DefaultMantineColor, Tuple } from '@mantine/core'

/**
 * Color shades generated at: https://noeldelgado.github.io/shadowlord/
 *
 * Shade step was set to `15%` & used colors from `-75%` to `+60%` of base
 */
// Regex to remove junk when copy/pasting from site: ^(?!#\w{6}).*|\n|\s$

/** Names of custom colors */
type CustomColors =
	| 'inReachPrimaryRegular'
	| 'inReachPrimaryHover'
	| 'inReachPrimaryDisabled'
	| 'inReachPrimaryBackground'
	| 'inReachSecondaryRegular'
	| 'inReachSecondaryHover'
	| 'inReachSecondaryDisabled'
	| 'inReachSecondaryBackground'
	| 'inReachTertiaryRegular'
	| 'inReachTertiaryHover'
	| 'inReachTertiaryDisabled '
	| 'inReachUtilitySuccess'
	| 'inReachUtilityError'
	| 'primaryText'
	| 'secondaryAlt1'
	| 'secondaryAlt2'
	| 'secondaryAlt3'
	| 'secondaryAlt4'

type DefineColors = Record<string, Tuple<string, 10>>

export const customColors = {
	/** Primary - normal - `green` - `Index 5` */
	inReachPrimaryRegular: [
		'#bff5da',
		'#99eec4',
		'#73e8ae',
		'#4de298',
		'#26db82',
		'#00d56c',
		'#00b55c',
		'#00954c',
		'#00753b',
		'#00552b',
	],
	/** Primary - hover - `green` - `Index 5` */
	inReachPrimaryHover: [
		'#bfdfd0',
		'#99ccb3',
		'#73b997',
		'#4da67a',
		'#26935e',
		'#008041',
		'#006d37',
		'#005a2e',
		'#004624',
		'#00331a',
	],
	/** Primary - disabled - `green` - `Index 5` */
	inReachPrimaryDisabled: [
		'#ecfcf4',
		'#e1faed',
		'#d5f8e7',
		'#caf6e0',
		'#bef4da',
		'#b3f2d3',
		'#98ceb3',
		'#7da994',
		'#628574',
		'#486154',
	],
	/** Primary - background - `green` - `Index 5` */
	inReachPrimaryBackground: [
		'#cdf5e1',
		'#afefcf',
		'#90e8bc',
		'#72e2aa',
		'#54dc98',
		'#36d686',
		'#2eb672',
		'#26965e',
		'#1e764a',
		'#165636',
	],
	/**
	 * Secondary - normal
	 *
	 * Background color for primary banners. - `blue` - `Index 5`
	 */
	inReachSecondaryRegular: [
		'#d1e4f6',
		'#b5d3f0',
		'#9ac3eb',
		'#7eb3e5',
		'#63a2e0',
		'#4792da',
		'#3c7cb9',
		'#326699',
		'#275078',
		'#1c3a57',
	],
	/** Secondary - hover - `blue` - `Index 5` */
	inReachSecondaryHover: [
		'#cad5e0',
		'#aabccd',
		'#8aa3bb',
		'#6b8aa8',
		'#4b7196',
		'#2b5883',
		'#254b6f',
		'#1e3e5c',
		'#183048',
		'#112334',
	],
	/** Secondary - disabled - `blue` - `Index 5` */
	inReachSecondaryDisabled: [
		'#f1f7fc',
		'#e9f2fb',
		'#e1edf9',
		'#d9e8f7',
		'#d0e3f6',
		'#c8def4',
		'#aabdcf',
		'#8c9bab',
		'#6e7a86',
		'#505962',
	],
	/** Secondary - background - `blue` - `Index 5` */
	inReachSecondaryBackground: [
		'#fbfcfe',
		'#f8fbfd',
		'#f5f9fd',
		'#f2f7fc',
		'#f0f6fc',
		'#edf4fb',
		'#c9cfd5',
		'#a6abb0',
		'#82868a',
		'#5f6264',
	],
	/** Tertiary - regular - `red` - `Index 5` */
	inReachTertiaryRegular: [
		'#f6cacf',
		'#f1abb3',
		'#eb8b96',
		'#e66b79',
		'#e04c5d',
		'#db2c40',
		'#ba2536',
		'#991f2d',
		'#781823',
		'#58121a',
	],
	/** Tertiary - hover - `red` - `Index 5` */
	inReachTertiaryHover: [
		'#e0c6c9',
		'#cda3a8',
		'#bb8188',
		'#a85f67',
		'#963c47',
		'#831a26',
		'#6f1620',
		'#5c121b',
		'#480e15',
		'#340a0f',
	],
	/** Tertiary - disabled - `red` - `Index 5` */
	inReachTertiaryDisabled: [
		'#fceff1',
		'#fbe6e8',
		'#f9dce0',
		'#f7d3d7',
		'#f6c9cf',
		'#f4c0c6',
		'#cfa3a8',
		'#ab868b',
		'#866a6d',
		'#624d4f',
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
		'#00c419' /* index 5 - Primary shade */,
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
		'#e1001c' /* index 5 - Primary shade */,
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
	 * `Index 4` - Grey
	 *
	 * `Index 0` - White text for dark mode.
	 */
	primaryText: [
		'#ffffff' /* Primary text shade for dark mode */,
		'#e6e6e6',
		'#cdcdce',
		'#b4b4b6',
		'#e9e9e9' /* Primary text shade for grey */,
		'#818285',
		'#686a6c',
		'#4f5154',
		'#36383b',
		'#1d1f23' /* Primary text shade for light mode */,
	],
	/** Secondary colors - `orange` - `index 5` */
	secondaryAlt1: [
		'#fcdbd4',
		'#fac5ba',
		'#f8afa0',
		'#f79986',
		'#f5836c',
		'#f36d52',
		'#cf5d46',
		'#aa4c39',
		'#863c2d',
		'#612c21',
	],
	/** Secondary colors - `yellow` - `index 5` */
	secondaryAlt2: [
		'#fff3d1',
		'#ffecb6',
		'#ffe59a',
		'#ffde7f',
		'#ffd763',
		'#ffd048',
		'#d9b13d',
		'#b39232',
		'#8c7228',
		'#66531d',
	],
	/** Secondary colors - `green` - `index 5` */
	secondaryAlt3: [
		'#c5ede2',
		'#a1e1d0',
		'#7ed6bf',
		'#5bcbad',
		'#38c09c',
		'#15b58a',
		'#129a75',
		'#0f7f61',
		'#0c644c',
		'#084837',
	],
	/** Secondary colors - `cyan` - `index 5` */
	secondaryAlt4: [
		'#c8eef5',
		'#a7e4ef',
		'#86dae9',
		'#65d0e3',
		'#44c6dd',
		'#23bcd7',
		'#1ea0b7',
		'#198497',
		'#136776',
		'#0e4b56',
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
