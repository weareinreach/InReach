import * as Sentry from '@sentry/nextjs'

import { t } from '../initTRPC'

export const sentryMiddleware = t.middleware(Sentry.Handlers.trpcMiddleware({ attachRpcInput: true }))
