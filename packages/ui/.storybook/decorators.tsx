import { MantineProvider, TypographyStylesProvider, MantineProviderProps } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NotificationsProvider } from '@mantine/notifications'
import { StoryContext, StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { transformer } from '@weareinreach/api/lib/transformer'
import { useState, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'

import { trpc, StorybookTRPC } from '~ui/lib/trpcClient'
import { storybookTheme } from '~ui/theme'

import { i18n } from './i18next'

const mantineProviderProps: Omit<MantineProviderProps, 'children'> = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}

export const WithMantine = (Story: StoryFn) => {
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			<TypographyStylesProvider>
				<NotificationsProvider>
					<ModalsProvider>
						<Story />
					</ModalsProvider>
				</NotificationsProvider>
			</TypographyStylesProvider>
		</MantineProvider>
	)
}

export const WithI18n = (Story: StoryFn, context: StoryContext) => {
	const { globals, parameters } = context
	const [locale, setLocale] = useState(globals.locale ?? 'en')

	useEffect(() => {
		if (parameters?.i18n && globals?.locale && globals.locale !== locale) {
			setLocale(globals.locale)
			parameters.i18n.changeLanguage(globals.locale)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [globals?.locale])

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
					url: '/trpc',
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
					url: '/trpc',
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
