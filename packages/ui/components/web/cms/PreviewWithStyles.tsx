import { ReactNode } from 'react'

import { MantineProvider } from '@mantine/core'

import { webCache, webTheme } from '../../../theme'

interface PreviewProps {
	children: ReactNode
}

export const PreviewWithStyles: React.FC<PreviewProps> = ({ children }) => {
	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={webTheme} emotionCache={webCache}>
			{children}
		</MantineProvider>
	)
}
