import { getTRPCMock } from '~ui/lib/getTrpcMock'

export const organization = {
	getIdFromSlug: getTRPCMock({
		path: ['organization', 'getIdFromSlug'],
		response: { id: 'orgn_MOCKED00000ID999999' },
	}),
}
