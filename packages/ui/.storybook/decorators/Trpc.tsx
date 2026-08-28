import { type StoryContext, type StoryFn } from '@storybook/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpLink, loggerLink } from '@trpc/client'
import { type ComponentType, useState } from 'react'

import { transformer } from '@weareinreach/util/transformer'
import { type StorybookTRPC, trpc } from '~ui/lib/trpcClient'

const storybookTRPC = trpc as StorybookTRPC

export const WithTRPC = (Story: StoryFn, { parameters }: StoryContext) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						staleTime: 1000 * 60 * 10, // 10 Minutes
						gcTime: 1000 * 60 * 60, // 1 Hour
					},
				},
			})
	)

	// Lazy initializer, matching tRPC's documented pattern - calling `createClient` eagerly on every
	// render (rather than only once, on mount) was producing a client whose internal untyped-client
	// symbol the Provider couldn't read back out (`Cannot read properties of undefined (reading
	// 'Symbol(trpc_untypedClient)')`), even though the freshly-created client looked valid in isolation.
	const [trpcClient] = useState(() =>
		storybookTRPC.createClient({
			links: [
				loggerLink(),
				httpLink({
					url: '/trpc',
					transformer,
				}),
			],
		})
	)
	const StoryComponent = Story as ComponentType

	return (
		<storybookTRPC.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<StoryComponent />
				{parameters.rqDevtools && <ReactQueryDevtools />}
			</QueryClientProvider>
		</storybookTRPC.Provider>
	)
}
