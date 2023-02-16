import { Prism } from '@mantine/prism'
import { createId } from '@paralleldrive/cuid2'
import { Meta, StoryObj } from '@storybook/react'
import { z } from 'zod'

import { useTypedRouterQuery } from './useTypedRouterQuery'

/**
 * It takes a {@link https://zod.dev/ Zod} schema and returns a router object with the query parsed according
 * to the schema
 */
const StoryDemo = ({ schema }: StoryProps) => {
	try {
		const router = useTypedRouterQuery(schema)
		return <Prism language='json'>{JSON.stringify(router, null, 2)}</Prism>
	} catch (error) {
		return <Prism language='json'>{JSON.stringify(error, null, 2)}</Prism>
	}
}

type StoryProps = {
	/** Zod Schema - See {@link https://zod.dev/ Zod documentation} */
	schema: z.ZodType
}

const meta = {
	title: 'Hooks/useTypedRouterQuery',
	component: StoryDemo,
	args: {
		schema: z.object({
			slug: z.string(),
			locationId: z.string(),
			serviceId: z.string(),
		}),
	},
	argTypes: {
		schema: {
			type: 'symbol',
			description: `Zod Schema - See [Zod documentation](https://zod.dev/)`,
		},
	},

	parameters: {
		docs: {
			description: {
				component: `It takes a [Zod](https://zod.dev/) schema and returns a [NextJS router](https://nextjs.org/docs/api-reference/next/router) object with the query parsed according to the schema`,
			},
			source: {
				code: `const router = useTypedRouterQuery(schema)`,
				language: 'typescript',
				type: 'auto',
			},
		},
	},
} satisfies Meta<typeof StoryDemo>

export default meta
type Story = StoryObj<typeof StoryDemo>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/7.0/react/api/csf
 * to learn how to use render functions.
 */
export const Success: Story = {
	parameters: {
		nextjs: {
			router: {
				pathname: '/org/[slug]/[locationId]/[serviceId]',
				asPath: `/org/mockOrg/${createId()}/${createId()}`,
				query: {
					slug: 'mockOrg',
					locationId: createId(),
					serviceId: createId(),
				},
			},
		},
	},
}

export const Fail: Story = {
	parameters: {
		nextjs: {
			router: {
				pathname: '/org/[slug]/[locationId]/[serviceId]',
				query: {
					slug: undefined,
					locationId: undefined,
					serviceId: undefined,
				},
			},
		},
	},
}
