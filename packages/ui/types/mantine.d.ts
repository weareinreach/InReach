import { type CustomColorDefinitions, type ThemeCustomObject } from '../theme'

declare module '@mantine/core' {
	export interface MantineThemeOther extends ThemeCustomObject {}
	export interface MantineThemeColorsOverride {
		colors: CustomColorDefinitions
	}
}
