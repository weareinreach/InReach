import { createServerSideHelpers } from '@trpc/react-query/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { GetServerSidePropsContext } from 'next'

import { createContext, transformer } from '../lib'
import { appRouter } from '../router'

export const trpcServerClient = async () =>
	createServerSideHelpers({
		router: appRouter,
		ctx: await createContext(),
		transformer,
	})
