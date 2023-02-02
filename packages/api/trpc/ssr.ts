import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { GetServerSidePropsContext } from 'next'

import { createContext, transformer } from '../lib'
import { appRouter } from '../router'

export const trpcServerClient = async () =>
	createProxySSGHelpers({
		router: appRouter,
		ctx: await createContext(),
		transformer,
	})
