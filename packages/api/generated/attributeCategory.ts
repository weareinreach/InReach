export const attributeCategory = [
	{ id: 'attc_01GV23GR3TMRH1M4W1KBEK7K0S', tag: 'additional-information', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR3WP661DDQWZQEMS0K7', tag: 'community', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR44R5HE8PQ2F4PM1AVV', tag: 'cost', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR458953HB8T17K7Z13V', tag: 'eligibility-requirements', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR46GXT4F61E015JE94F', tag: 'languages', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR47T68BS8FNYNKE79EQ', tag: 'system', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR476VZ4ZGS98JBTQYSV', tag: 'service-access-instructions', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR48346KFTB1RGM2E826', tag: 'organization-leadership', icon: null, ns: 'attribute' },
	{ id: 'attc_01GV23GR49494HXKGPZTX8FQDZ', tag: 'service-focus', icon: null, ns: 'attribute' },
] as const

export type AtttributeCategory = (typeof attributeCategory)[number]
