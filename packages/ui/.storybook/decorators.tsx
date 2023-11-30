import { Center, Grid, MantineProvider, type MantineProviderProps } from '@mantine/core'
// import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { type StoryContext, type StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpLink, loggerLink } from '@trpc/client'
import { StrictMode, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { devtoolsLink } from 'trpc-client-devtools-link'

import { transformer } from '@weareinreach/api/lib/transformer'
import { BodyGrid } from '~ui/layouts/BodyGrid'
import { type StorybookTRPC, trpc } from '~ui/lib/trpcClient'
import { GoogleMapsProvider } from '~ui/providers/GoogleMaps'
import { SearchStateProvider } from '~ui/providers/SearchState'
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
			{/* <ModalsProvider> */}
			<Notifications />
			<Story />
			{/* </ModalsProvider> */}
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

export const WithTRPC = (Story: StoryFn, { parameters }: StoryContext) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
					},
				},
			})
	)

	const trpcClientOpts = {
		links: [
			devtoolsLink({
				enabled: true,
			}),
			loggerLink(),
			httpLink({
				url: '/trpc',
			}),
		],
		transformer,
	}

	const [trpcClient, setTRPCClient] = useState(storybookTRPC.createClient(trpcClientOpts))
	useEffect(() => {
		queryClient.clear()
		const trpc_client = storybookTRPC.createClient(trpcClientOpts)
		setTRPCClient(trpc_client)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setTRPCClient, queryClient])

	return (
		<storybookTRPC.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<Story />
				{parameters.rqDevtools && <ReactQueryDevtools />}
			</QueryClientProvider>
		</storybookTRPC.Provider>
	)
}

export type LayoutsDecorator = 'centeredFullscreen' | 'centeredHalf' | 'gridSingle' | 'gridDouble'
export const Layouts = (Story: StoryFn, context: StoryContext) => {
	const { layoutWrapper } = context.parameters

	if (!layoutWrapper) return <Story />

	switch (layoutWrapper) {
		case 'centeredFullscreen': {
			return (
				<Center h='100vh' w='100vw'>
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

export const WithSearchState = (Story: StoryFn, { parameters }: StoryContext) => (
	<SearchStateProvider initState={parameters.searchContext}>
		<Story />
	</SearchStateProvider>
)
WithSearchState.displayName = 'SearchStateProvider'

export const WithWhyDidYouRender = (Story: StoryFn, { parameters, component }: StoryContext) => {
	const { wdyr } = parameters
	if (wdyr && component) {
		// @ts-expect-error Module augmentation is too complex.
		component.whyDidYouRender = wdyr
	}
	return <Story />
}

export const WithGoogleMaps = (Story: StoryFn) => {
	return (
		<GoogleMapsProvider>
			<Story />
		</GoogleMapsProvider>
	)
}
