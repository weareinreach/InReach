export const attributeCategory = [
	{ id: 'attc_01GSKV6RNYJ0CA4R5QGZ81XZYN', tag: 'additional-information', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6RQYCP9R5KR54N1XBG8J', tag: 'community', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6S215SEHFTHT1AEBPKAT', tag: 'cost', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6S2M6SA7TPKYT9TS5T5Q', tag: 'eligibility-requirements', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6S4EHQCGGGXRG33Y41KH', tag: 'languages', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6S58V0J4JV0S93EK463H', tag: 'system', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6S5MK8CHZ1XBPPW5KR6M', tag: 'service-access-instructions', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6S712NEGNVH7S0B8ZWZ4', tag: 'organization-leadership', icon: null, ns: 'attribute' },
	{ id: 'attc_01GSKV6S81RGRGZ4ARZHN8CW63', tag: 'service-focus', icon: null, ns: 'attribute' },
] as const

export type AtttributeCategory = (typeof attributeCategory)[number]
