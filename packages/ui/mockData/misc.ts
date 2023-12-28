import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const miscMock = {
	hasContactInfo: getTRPCMock({
		path: ['misc', 'hasContactInfo'],
		response: true,
	}),
} satisfies MockHandlerObject<'misc'>
