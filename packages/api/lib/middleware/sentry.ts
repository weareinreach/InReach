import { Handlers } from '@sentry/node'

import { t } from '../initTRPC'

export const sentryMiddleware = t.middleware(Handlers.trpcMiddleware({ attachRpcInput: true }))
