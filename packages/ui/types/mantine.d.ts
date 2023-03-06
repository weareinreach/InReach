/* eslint-disable import/consistent-type-specifier-style */
import type { MantineTheme, ContextStylesParams, Variants, BadgeProps as _BadgeProps } from '@mantine/core'

export type VariantDef<P = any> = (
	theme: MantineTheme,
	params: P,
	context: ContextStylesParams
) => Record<string, CSSObject>

// declare module '@mantine/core' {
// 	export type BadgeVariants = Variants<
// 		| 'light'
// 		| 'filled'
// 		| 'outline'
// 		| 'dot'
// 		| 'gradient'
// 		| 'community'
// 		| 'service'
// 		| 'leader'
// 		| 'privatePractice'
// 		| 'claimed'
// 		| 'unclaimed'
// 		| 'verified'
// 		| 'attribute'
// 	>
// 	export interface BadgeProps {
// 		variant?:
// 			| Variants<'light' | 'filled' | 'outline' | 'dot' | 'gradient'>
// 			| 'community'
// 			| 'service'
// 			| 'leader'
// 			| 'privatePractice'
// 			| 'claimed'
// 			| 'unclaimed'
// 			| 'verified'
// 			| 'attribute'
// 	}

// export interface BadgeProps extends Omit<_BadgeProps, 'variant'> {
// 	variant?: Variants<
// 		| 'light'
// 		| 'filled'
// 		| 'outline'
// 		| 'dot'
// 		| 'gradient'
// 		| 'community'
// 		| 'service'
// 		| 'leader'
// 		| 'privatePractice'
// 		| 'claimed'
// 		| 'unclaimed'
// 		| 'verified'
// 		| 'attribute'
// 	>
// }
// }
