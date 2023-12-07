import { type StoryContext, type StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpLink, loggerLink } from '@trpc/client'
import { useEffect, useState } from 'react'
import { devtoolsLink } from 'trpc-client-devtools-link'

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
