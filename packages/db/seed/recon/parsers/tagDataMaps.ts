export const tagDataMaps = {
	minAge: new Map<MapKey, NumRange>([
		['18 and over', { min: 18 }],
		['18 and over', { min: 18 }],
		['12-25', { min: 12, max: 25 }],
		['14-20', { min: 14, max: 20 }],
		['21+', { min: 21 }],
		['18+', { min: 18 }],
		['For individuals 18+ living in the Greater Toronto Area who receive social assistance', { min: 18 }],
		['age 15 and over', { min: 15 }],
		['13 and over', { min: 13 }],
		['age 60 and over', { min: 60 }],
		['18 years or older', { min: 18 }],
		['1877', { min: 18, max: 77 }],
		['11-22', { min: 11, max: 22 }],
		['13-24', { min: 13, max: 24 }],
		['3 months', { min: 0.25 }],
	]),
	maxAge: new Map<MapKey, NumRange>([
		['18 and under', { max: 18 }],
		['Age 18 and under', { max: 18 }],
		['age 18 and under', { max: 18 }],
	]),
	range: new Map<MapKey, NumRange>([
		['18-24, 18-21', { min: 18, max: 24 }],
		['13-17; 18-24', { min: 13, max: 24 }],
		['13-24 and parents', { min: 13, max: 24 }],
		['ages 19-64', { min: 19, max: 64 }],
		['18-255724', { min: 18, max: 25 }],
	]),
}

type NumRange = {
	min?: number
	max?: number
}

type MapKey = string | number | boolean
