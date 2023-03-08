export const attributeCategory = [
	{ id: 'attc_01GV0TJNK2D5FJAGGQCB11EK0X', tag: 'additional-information', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNK3VDSED9CTP47SDATJ', tag: 'community', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNKBDKA8AX3K7E9AF0EJ', tag: 'cost', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNKCKQMKDW68CNH60D48', tag: 'eligibility-requirements', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNKDS1ARTEDNE1D4DWJZ', tag: 'languages', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNKEW2JSBHGKWWZTAT5T', tag: 'system', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNKEA4T08FH0TP6EZ5D9', tag: 'service-access-instructions', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNKFD37Q5Z1XWHNE77KV', tag: 'organization-leadership', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV0TJNKGZ5E02D7KRRPVDZFH', tag: 'service-focus', icon: null, ns: 'attribute' },
] as const

export type AtttributeCategory = (typeof attributeCategory)[number]
