import { MantineProvider, MantineProviderProps, Center, Grid } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { StoryContext, StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpLink, loggerLink } from '@trpc/client'
import { transformer } from '@weareinreach/api/lib/transformer'
import { useState, useEffect, StrictMode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { devtoolsLink } from 'trpc-client-devtools-link'

import { BodyGrid } from '~ui/layouts/BodyGrid'
import { trpc, StorybookTRPC } from '~ui/lib/trpcClient'
import { storybookTheme } from '~ui/theme/storybook'

import { i18n } from './i18next'

const mantineProviderProps: Omit<MantineProviderProps, 'children'> = {
	withCSSVariables: false,
	withGlobalStyles: true,
	withNormalizeCSS: false,
}

export const WithMantine = (Story: StoryFn) => {
	return (
		<MantineProvider theme={storybookTheme} {...mantineProviderProps}>
			{/* <TypographyStylesProvider> */}
			<ModalsProvider>
				<Notifications />
				<Story />
			</ModalsProvider>
			{/* </TypographyStylesProvider> */}
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
				httpLink({
					url: '/trpc',
				}),
				devtoolsLink({
					enabled: true,
				}),
				loggerLink(),
			],
			transformer,
		})
	)
	useEffect(() => {
		queryClient.clear()
		const trpc_client = storybookTRPC.createClient({
			links: [
				httpLink({
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

export const Layouts = (Story: StoryFn, context: StoryContext) => {
	const { layoutWrapper } = context.parameters

	if (!layoutWrapper) return <Story />

	switch (layoutWrapper) {
		case 'centeredFullscreen': {
			return (
				<Center h='100vh'>
					<Story />
				</Center>
			)
		}
		case 'centeredHalf': {
			return (
				<Center h='50vh'>
					<Story />
				</Center>
			)
		}
		case 'gridSingle': {
			return (
				<BodyGrid pt={16}>
					<Grid.Col>
						<Story />
					</Grid.Col>
				</BodyGrid>
			)
		}
		case 'gridDouble': {
			return (
				<BodyGrid pt={16}>
					<Grid.Col xs={12} sm={8}>
						<Story />
					</Grid.Col>
				</BodyGrid>
			)
		}
	}
}
export const WithStrictMode = (Story: StoryFn, context: StoryContext) =>
	context.parameters.disableStrictMode ? (
		<Story />
	) : (
		<StrictMode>
			<Story />
		</StrictMode>
	)
WithStrictMode.displayName = 'StrictModeWrapper'
export type LayoutsDecorator = 'centeredFullscreen' | 'centeredHalf' | 'gridSingle' | 'gridDouble'
