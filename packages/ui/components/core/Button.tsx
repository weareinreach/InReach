import {
	Button as MantineButton,
	type ButtonProps as MantineButtonProps,
	type PolymorphicComponentProps,
} from '@mantine/core'
import { merge } from 'merge-anything'
import { forwardRef, type JSX, type ReactNode } from 'react'

import classes from './Button.module.css'

const customVariants = [
	'primary',
	'secondary',
	'accent',
	'primary-icon',
	'secondary-icon',
	'accent-icon',
	'primarySm',
	'secondarySm',
	'primaryLg',
	'primaryLgRed',
	'secondaryLg',
] as const

type VariantClassNames = Partial<Record<'root' | 'inner' | 'label' | 'section', string>>

const variantClassNames: Record<(typeof customVariants)[number], VariantClassNames> = {
	primary: {
		root: classes.primaryRoot,
		inner: classes.primaryInner,
		label: classes.primaryLabel,
		section: classes.primarySection,
	},
	secondary: {
		root: classes.secondaryRoot,
		inner: classes.secondaryInner,
		label: classes.secondaryLabel,
		section: classes.secondarySection,
	},
	accent: {
		root: classes.accentRoot,
		inner: classes.accentInner,
		label: classes.accentLabel,
		section: classes.accentSection,
	},
	'primary-icon': { root: classes.primaryIconRoot, inner: classes.primaryIconInner },
	'secondary-icon': { root: classes.secondaryIconRoot, inner: classes.secondaryIconInner },
	'accent-icon': { root: classes.accentIconRoot, inner: classes.accentIconInner },
	primarySm: {
		root: classes.primarySmRoot,
		inner: classes.primarySmInner,
		label: classes.primarySmLabel,
		section: classes.primarySmSection,
	},
	secondarySm: {
		root: classes.secondarySmRoot,
		inner: classes.secondarySmInner,
		label: classes.secondarySmLabel,
		section: classes.secondarySmSection,
	},
	primaryLg: { root: classes.primaryLgRoot, inner: classes.primaryLgInner },
	primaryLgRed: { root: classes.primaryLgRedRoot },
	secondaryLg: { root: classes.secondaryLgRoot, inner: classes.secondaryLgInner },
}

export const Button = forwardRef<HTMLButtonElement, PolymorphicComponentProps<'button', ButtonProps>>(
	(props, ref) => {
		const isCustom = (customVariants as ReadonlyArray<string>).includes(props.variant ?? 'filled')
		// A `<Button>` with no `variant` at all used to inherit this app's global Button default
		// (black background, white text, xl radius) from a theme-level `styles`/`defaultProps`
		// override that applied unconditionally - that global default didn't survive the move to
		// per-variant CSS Modules, so it's restored here explicitly rather than falling through to
		// Mantine's own bare default (a green `filled` button, since `theme.primaryColor` is green).
		const baseClasses = isCustom
			? variantClassNames[props.variant as (typeof customVariants)[number]]
			: props.variant === undefined
				? { root: classes.defaultRoot, inner: classes.defaultInner }
				: {}

		const { children, variant, classNames, leftIcon, ...others } = props as MantineButtonProps & ButtonProps

		const mantineVariant = isCustom ? undefined : (variant as ButtonVariant)

		return (
			<MantineButton
				variant={mantineVariant}
				classNames={merge(classNames ?? {}, baseClasses)}
				leftSection={leftIcon}
				ref={ref}
				{...others}
				w={props.fullWidth ? '100%' : undefined}
			>
				{children}
			</MantineButton>
		)
	}
)
Button.displayName = '@weareinreach/ui/components/core/Button'

export interface ButtonProps extends MantineButtonProps {
	/** Button style/design */
	variant?: (typeof customVariants)[number] | 'filled' | 'outline'
	/** Label Text */
	children?: ReactNode
	/** Icon to render for 'icon' variants - pass in the full Icon component */
	leftIcon?: JSX.Element
	/** Disabled state */
	disabled?: boolean
	/** Set width to 100% */
	fullWidth?: boolean
	loading?: boolean
}
type ButtonVariant = ButtonProps['variant']
