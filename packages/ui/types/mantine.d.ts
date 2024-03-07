/* eslint-disable import/consistent-type-specifier-style */
import type { CustomColorDefinitions, ThemeCustomObject } from '../theme'
import type { BadgeProps as _BadgeProps, ContextStylesParams, CSSObject, MantineTheme } from '@mantine/core'

export type VariantDef<P = unknown> = (
	theme: MantineTheme,
	params: P,
	context: ContextStylesParams
) => Record<string, CSSObject>

export type VariantObj = MantineTheme['components'][string]['variants']

declare module '@mantine/core' {
	export interface MantineThemeOther extends ThemeCustomObject {}
	export interface MantineThemeColorsOverride {
		colors: CustomColorDefinitions
	}
}
