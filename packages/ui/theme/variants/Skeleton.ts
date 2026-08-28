import { rem } from '@mantine/core'
import { type CSSProperties } from 'react'

type VariantStyles = Record<string, Partial<Record<'root', CSSProperties>>>

/** `h1`/`h3`/`badgeGroup`/`textArea` were dropped - confirmed zero usage repo-wide. */
export const Skeleton: VariantStyles = {
	text: { root: { height: rem(16 * 1.5) } },
	utility: { root: { height: rem(16 * 1.25) } },
	utilitySm: { root: { height: rem(14 * 1.25) } },
	h2: { root: { height: rem(24 * 1.25) } },
}
