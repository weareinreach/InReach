export const attributeCategory = [
	{ id: 'attc_01GVBN0WA9BAVQ4B05BRHVZ6MW', tag: 'additional-information', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WABRVEB23YNZH7YTG8A', tag: 'community', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WAP65G5A0ERQPTC02QA', tag: 'cost', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WAP9J7F1XH3T9YDQGAD', tag: 'eligibility-requirements', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WARNKYKDR6TTB4GW1PP', tag: 'languages', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WASE0Z4NWNY1GSFZAAQ', tag: 'system', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WAS97ZJ97D2M9MBF5PX', tag: 'service-access-instructions', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WAVZACH2BT7DME6NAKS', tag: 'organization-leadership', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WAWZ11VHPHQQN0SN7YR', tag: 'service-focus', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WAYB7DGTGXXF1RN5F97', tag: 'law-practice-options', icon: null, ns: 'attribute' },
	{ id: 'attc_01GVBN0WAZ8D84NA9DDWA25NFF', tag: 'service-provider-options', icon: null, ns: 'attribute' },
] as const

export type AtttributeCategory = (typeof attributeCategory)[number]
