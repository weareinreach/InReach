import { MantineProvider, TypographyStylesProvider, MantineProviderProps } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { transformer } from '@weareinreach/api/lib/transformer'
import { useState, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'

import { i18n } from './i18next'
import { trpc, StorybookTRPC } from '../lib/trpcClient'
import { storybookTheme } from '../theme'

const mantineProviderProps: Omit<MantineProviderProps, 'children'> = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}

export const WithMantine = (Story: StoryFn) => {
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			<ModalsProvider>
				<TypographyStylesProvider>
					<Story />
				</TypographyStylesProvider>
			</ModalsProvider>
		</MantineProvider>
	)
}

export const WithI18n = (Story: StoryFn) => {
	return (
		<I18nextProvider i18n={i18n}>
			<Story />
		</I18nextProvider>
	)
}

const storybookTRPC = trpc as StorybookTRPC

export const WithTRPC = (Story: StoryFn) => {
	const [queryClient] = useState(() => new QueryClient())
	const [trpcClient, setTRPCClient] = useState(
		storybookTRPC.createClient({
			links: [
				httpBatchLink({
					url: 'http://localhost:6006/trpc',
				}),
			],
			transformer,
		})
	)
	useEffect(() => {
		queryClient.clear()
		const trpc_client = storybookTRPC.createClient({
			links: [
				httpBatchLink({
					url: 'http://localhost:6006/trpc',
				}),
			],

			transformer,
		})
		setTRPCClient(trpc_client)
	}, [setTRPCClient, queryClient])

	return (
		<storybookTRPC.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<Story />
			</QueryClientProvider>
		</storybookTRPC.Provider>
	)
}
