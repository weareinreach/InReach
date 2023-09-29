import { event as originalEvent } from 'nextjs-google-analytics'
import { type LiteralUnion } from 'type-fest'

export const event: GAEvent = (action, params) => {
	if (action.length > 40) {
		throw new Error('Event `action` name must be less than 40 characters!', { cause: { action, params } })
	}
	originalEvent(action, params)
}

type GAEvent = (
	action: LiteralUnion<Gtag.EventNames, string>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	params?: Gtag.EventParams & { [k: string]: any }
) => void
