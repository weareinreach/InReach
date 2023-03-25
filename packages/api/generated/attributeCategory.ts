export const attributeCategory = [
	{ id: 'attc_01GW2HHFV3DJ380F351SKB0B74', tag: 'additional-information', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFV5XN6DW56SZ2GY5AEN', tag: 'community', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVFKNMYPN8F86M0H576', tag: 'cost', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVGHPW1Y72SA8377623', tag: 'eligibility-requirements', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVJQQ68XGSBXM976BDF', tag: 'languages', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVKM2PSHFWVFM0TWX1P', tag: 'system', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVKAMMGPD71H90XRJ38', tag: 'service-access-instructions', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVMNHV2ZS5875JWCRJ7', tag: 'organization-leadership', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVNXMNJNV47BF2BPM1R', tag: 'service-focus', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVRSN3W3GYZZ43WCW24', tag: 'law-practice-options', icon: null, ns: 'attribute' },
	{ id: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', tag: 'service-provider-options', icon: null, ns: 'attribute' },
] as const

export type AtttributeCategory = (typeof attributeCategory)[number]
