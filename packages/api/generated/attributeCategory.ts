export const attributeCategory = [
	{ id: 'attc_01GTJ0VWEN6ZV6SVZFRWKDJX47', tag: 'additional-information', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VWGD7NE1H1RC67Y0WKV3', tag: 'community', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VWW4F6JC0HZPKBWEPXD8', tag: 'cost', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VWWTJSTGQ7FN4YV7M9A5', tag: 'eligibility-requirements', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VWZ1M4FKJY79P0CTMP8Q', tag: 'languages', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VWZYCK97RAFENVQCVKJC', tag: 'system', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VX0BRSHSR9PM0ECTENYA', tag: 'service-access-instructions', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VX20EPC5Y32PV7F6T9TT', tag: 'organization-leadership', icon: null, ns: 'attribute' },
	{ id: 'attc_01GTJ0VX33HMFYDJ49BPXS8A2E', tag: 'service-focus', icon: null, ns: 'attribute' },
] as const

export type AtttributeCategory = (typeof attributeCategory)[number]
