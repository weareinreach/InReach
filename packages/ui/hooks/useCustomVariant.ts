import { type MantineTheme } from '@mantine/core'

import { variantNames } from '~ui/theme/variants'

const additions = {
	Link: variantNames.Anchor,
} as const

export const useCustomVariant = () => ({ ...variantNames, ...additions })
