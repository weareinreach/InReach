import { z } from 'zod'

import { withUrlScheme } from '@weareinreach/util/url'

/** A web address that must be valid; `https://` is added first when it was entered without one. */
export const webUrl = (message?: string) => z.string().transform(withUrlScheme).pipe(z.url(message))

/** A web address saved as entered, except `https://` is added when it was entered without one. */
export const webUrlString = () => z.string().transform(withUrlScheme)
