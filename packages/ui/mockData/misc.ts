import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

const miscMockData = {
	hasContactInfo: true,
} satisfies MockDataObject<'misc'>

export const miscMock = {
	hasContactInfo: getTRPCMock({
		path: ['misc', 'hasContactInfo'],
		response: miscMockData.hasContactInfo,
	}),
} satisfies MockHandlerObject<'misc'>
