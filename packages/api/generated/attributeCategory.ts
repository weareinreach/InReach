export const attributeCategory = [
	{ id: 'attc_01GW0PY5VMQ0QD6D8HPDZ72GT7', tag: 'additional-information', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5VQJCNMXS8YAZW1EHZ6', tag: 'community', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5W29Y011Z4WEKNQWAP3', tag: 'cost', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5W2YZRPZBD94CMPW25E', tag: 'eligibility-requirements', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5W4RHQBAGA0QHNJEDSN', tag: 'languages', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5W5SDA449Q91NMH8Y6R', tag: 'system', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5W5YQTYBT2RJF8REC7N', tag: 'service-access-instructions', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5W74HHZ2EJ44JARPRB5', tag: 'organization-leadership', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5W8RD9DQ3XVCF6W6X0G', tag: 'service-focus', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5WBTTEK32AFXZG1AE0H', tag: 'law-practice-options', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW0PY5WC8WK0XASNE15FHPS1', tag: 'service-provider-options', icon: null, ns: 'attribute' },
] as const

export type AtttributeCategory = (typeof attributeCategory)[number]
