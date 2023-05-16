/* eslint-disable import/consistent-type-specifier-style */
import type { ThemeCustomObject } from '../theme'
import type { BadgeProps as _BadgeProps, ContextStylesParams, MantineTheme } from '@mantine/core'

export type VariantDef<P = unknown> = (
	theme: MantineTheme,
	params: P,
	context: ContextStylesParams
) => Record<string, CSSObject>

export type VariantObj = MantineTheme['components'][string]['variants']

declare module '@mantine/core' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface MantineThemeOther extends ThemeCustomObject {}
}
