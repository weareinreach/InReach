/**
 * Registry of valid custom variant name strings, used for call-site type-safety
 * (`variant={variants.Text.utility1}` via `useCustomVariant()`). The actual style implementations live in
 * each component's own file/CSS module and are wired directly into `theme/common.tsx` (or, for Button,
 * entirely within `~ui/components/core/Button` itself) - this is no longer an aggregated object fed into a
 * theme-level `variants` key (that mechanism doesn't exist in v7).
 *
 * Badge, Divider, and Input's old theme-level variant systems were removed entirely - confirmed dead (Badge
 * superseded by newer component-local styles, Divider/Input's sole variants had zero usage). Button's own old
 * system's `accent`/`accentLg` were also dropped (confirmed dead / permanently shadowed); its other 5
 * variants are alive and now live in Button.tsx's own CSS module.
 */
export const variantNames = {
	Button: {
		primarySm: 'primarySm',
		secondarySm: 'secondarySm',
		primaryLg: 'primaryLg',
		primaryLgRed: 'primaryLgRed',
		secondaryLg: 'secondaryLg',
	},
	Anchor: {
		inline: 'inline',
		inlineInverted: 'inlineInverted',
		inlineInvertedUtil1: 'inlineInvertedUtil1',
		inlineInvertedUtil2: 'inlineInvertedUtil2',
		inheritStyle: 'inheritStyle',
		block: 'block',
		inlineUtil1: 'inlineUtil1',
		inlineUtil1darkGray: 'inlineUtil1darkGray',
		card: 'card',
		pagination: 'pagination',
		inlineUtil2darkGray: 'inlineUtil2darkGray',
		navMenu: 'navMenu',
	},
	Card: {
		hoverCoolGray: 'hoverCoolGray',
	},
	List: {
		inline: 'inline',
		inlineBullet: 'inlineBullet',
		textDarkGray: 'textDarkGray',
		inlineBulletUtil2DarkGray: 'inlineBulletUtil2DarkGray',
		inlineUtil2DarkGray: 'inlineUtil2DarkGray',
	},
	Skeleton: {
		text: 'text',
		/** Utility 1 & 2 */
		utility: 'utility',
		/** Utility 3 & 4 */
		utilitySm: 'utilitySm',
		h2: 'h2',
	},
	Text: {
		utility1: 'utility1',
		utility2: 'utility2',
		utility3: 'utility3',
		utility4: 'utility4',
		utility1darkGray: 'utility1darkGray',
		utility1darkGrayStrikethru: 'utility1darkGrayStrikethru',
		utility2darkGray: 'utility2darkGray',
		utility3darkGray: 'utility3darkGray',
		utility4darkGray: 'utility4darkGray',
		darkGray: 'darkGray',
		darkGrayStrikethru: 'darkGrayStrikethru',
		utility1white: 'utility1white',
		utility3darkGrayStrikethru: 'utility3darkGrayStrikethru',
		utility4darkGrayStrikethru: 'utility4darkGrayStrikethru',
	},
	Title: {
		darkGray: 'darkGray',
		darkGrayStrikethru: 'darkGrayStrikethru',
	},
	Tooltip: {
		utility1: 'utility1',
	},
} as const

export type VariantNames = {
	[K in keyof typeof variantNames]: {
		[V in keyof (typeof variantNames)[K]]: V
	}
}
