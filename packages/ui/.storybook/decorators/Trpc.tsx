import { type StoryContext, type StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpLink, loggerLink } from '@trpc/client'
import { useState } from 'react'

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
						cacheTime: 1000 * 60 * 60, // 1 Hour
					},
				},
			})
	)

	const trpcClientOpts = {
		links: [
			loggerLink(),
			httpLink({
				url: '/trpc',
			}),
		],
		transformer,
	}

	const [trpcClient, _setTRPCClient] = useState(storybookTRPC.createClient(trpcClientOpts))

	return (
		<storybookTRPC.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<Story />
				{parameters.rqDevtools && <ReactQueryDevtools />}
			</QueryClientProvider>
		</storybookTRPC.Provider>
	)
}
