import { ApiInput, ApiOutput } from '@weareinreach/api'

export const mockAutocomplete = (
	input: ApiInput['geo']['autocomplete']
): ApiOutput['geo']['autocomplete'] => {
	const searchRegex = new RegExp(`.*${input.search}.*`, 'i')
	const results = locationSearchMockData.names
		.filter(({ searchValue }) => searchRegex.test(searchValue))
		.map(({ searchValue, ...data }) => ({ ...data }))

	return { results, status: 'OK' }
}

export const mockGeocode = (input: ApiInput['geo']['geoByPlaceId']): ApiOutput['geo']['geoByPlaceId'] => {
	// const searchRegex = new RegExp(`.*${input.search}.*`, 'i')
	const results = locationSearchMockData.locations
		.filter(({ placeId }) => placeId === input)
		.map(({ geometry, ...data }) => ({ geometry }))

	return { result: results[0], status: 'OK' }
}

const locationSearchMockData = {
	names: [
		{
			placeId: 'v9c7vv128hlvo0m2p6i2x1v6426i',
			value: 'New York',
			subheading: 'Queens, NY, US',
			searchValue: 'New York, Queens, NY, US',
		},
		{
			placeId: 'h9e8yw432nhro1c4o6y9s1b3636v',
			value: 'Los Angeles',
			subheading: 'Los Angeles, CA, US',
			searchValue: 'Los Angeles, Los Angeles, CA, US',
		},
		{
			placeId: 'h7b8gt028yqer4p8i2u4l8q1523x',
			value: 'Chicago',
			subheading: 'Cook, IL, US',
			searchValue: 'Chicago, Cook, IL, US',
		},
		{
			placeId: 'f8l6iv834xhqg3a1l1u1o8g8627z',
			value: 'Miami',
			subheading: 'Miami-Dade, FL, US',
			searchValue: 'Miami, Miami-Dade, FL, US',
		},
		{
			placeId: 'a6z8nj171pbjb1i1h4z0l9n6755m',
			value: 'Dallas',
			subheading: 'Dallas, TX, US',
			searchValue: 'Dallas, Dallas, TX, US',
		},
		{
			placeId: 'z5a2ps335usgt1o7m8x1w7o3437t',
			value: 'Houston',
			subheading: 'Harris, TX, US',
			searchValue: 'Houston, Harris, TX, US',
		},
		{
			placeId: 'v5k1nh657hijm8u4j1h8y1x8161h',
			value: 'Philadelphia',
			subheading: 'Philadelphia, PA, US',
			searchValue: 'Philadelphia, Philadelphia, PA, US',
		},
		{
			placeId: 'j4w6yn512jkqq2r5d3e4y1x3401l',
			value: 'Atlanta',
			subheading: 'Fulton, GA, US',
			searchValue: 'Atlanta, Fulton, GA, US',
		},
		{
			placeId: 'p9z8bo212bcfy0a4c3g2r8m1348p',
			value: 'Washington',
			subheading: 'District of Columbia, DC, US',
			searchValue: 'Washington, District of Columbia, DC, US',
		},
		{
			placeId: 'x8w2pl911vkec1p7n7u9d2w8791r',
			value: 'Boston',
			subheading: 'Suffolk, MA, US',
			searchValue: 'Boston, Suffolk, MA, US',
		},
		{
			placeId: 'e7f1od477hora2l8g2a8g7m4283a',
			value: 'Phoenix',
			subheading: 'Maricopa, AZ, US',
			searchValue: 'Phoenix, Maricopa, AZ, US',
		},
		{
			placeId: 'g1q9vi249jrec3x6e9o8w4k4431e',
			value: 'Detroit',
			subheading: 'Wayne, MI, US',
			searchValue: 'Detroit, Wayne, MI, US',
		},
		{
			placeId: 'o7y3wu258pdht1n6x4j0g4a4197w',
			value: 'Seattle',
			subheading: 'King, WA, US',
			searchValue: 'Seattle, King, WA, US',
		},
		{
			placeId: 'm6p4oi095ucwx5l9y3d1b1c7603v',
			value: 'San Francisco',
			subheading: 'San Francisco, CA, US',
			searchValue: 'San Francisco, San Francisco, CA, US',
		},
		{
			placeId: 'k5m6ra593sdqg1w7p3e1d9z7756b',
			value: 'San Diego',
			subheading: 'San Diego, CA, US',
			searchValue: 'San Diego, San Diego, CA, US',
		},
		{
			placeId: 'd5g3tn102yqpd0z3h1q3i7s5164r',
			value: 'Minneapolis',
			subheading: 'Hennepin, MN, US',
			searchValue: 'Minneapolis, Hennepin, MN, US',
		},
		{
			placeId: 'm2k9ry579igfc5f8w3i0e5i3346d',
			value: 'Brooklyn',
			subheading: 'Kings, NY, US',
			searchValue: 'Brooklyn, Kings, NY, US',
		},
		{
			placeId: 'g4e6wh692jwgf2z3f3r6k1l1184w',
			value: 'Tampa',
			subheading: 'Hillsborough, FL, US',
			searchValue: 'Tampa, Hillsborough, FL, US',
		},
		{
			placeId: 'g6p5hz725pqxh9d9x7w6h4z0733x',
			value: 'Denver',
			subheading: 'Denver, CO, US',
			searchValue: 'Denver, Denver, CO, US',
		},
		{
			placeId: 'p7n4pt581bydd6t6j9g4c7b4336c',
			value: 'Queens',
			subheading: 'Queens, NY, US',
			searchValue: 'Queens, Queens, NY, US',
		},
		{
			placeId: 'o1t5pn583kpeb8e2v2w9i4q4119t',
			value: 'Baltimore',
			subheading: 'Baltimore, MD, US',
			searchValue: 'Baltimore, Baltimore, MD, US',
		},
		{
			placeId: 't7e7ok334xgsh8q3h4q4l2m5824d',
			value: 'Las Vegas',
			subheading: 'Clark, NV, US',
			searchValue: 'Las Vegas, Clark, NV, US',
		},
		{
			placeId: 'y3o8mb567rnjt9v9u3t6e7k6124e',
			value: 'St. Louis',
			subheading: 'St. Louis, MO, US',
			searchValue: 'St. Louis, St. Louis, MO, US',
		},
		{
			placeId: 'b1q5dh343fgqr2w2m5z7r0d3673b',
			value: 'Portland',
			subheading: 'Multnomah, OR, US',
			searchValue: 'Portland, Multnomah, OR, US',
		},
		{
			placeId: 'r4u6wq218lrbz6i4p8v2q1p4971k',
			value: 'Riverside',
			subheading: 'Riverside, CA, US',
			searchValue: 'Riverside, Riverside, CA, US',
		},
	],
	locations: [
		{
			placeId: 'v9c7vv128hlvo0m2p6i2x1v6426i',
			geometry: {
				location: {
					lat: -89.9994,
					lng: 6.0222,
				},
				bounds: {
					northeast: {
						lat: 8.4018,
						lng: -126.6084,
					},
					southwest: {
						lat: -81.9646,
						lng: 124.493,
					},
				},
				viewport: {
					northeast: {
						lat: -20.6148,
						lng: -2.1118,
					},
					southwest: {
						lat: -67.1275,
						lng: -87.9182,
					},
				},
			},
		},
		{
			placeId: 'h9e8yw432nhro1c4o6y9s1b3636v',
			geometry: {
				location: {
					lat: 21.8233,
					lng: 138.2632,
				},
				bounds: {
					northeast: {
						lat: -72.7388,
						lng: 103.9609,
					},
					southwest: {
						lat: 83.7282,
						lng: -129.311,
					},
				},
				viewport: {
					northeast: {
						lat: 60.0396,
						lng: 49.7454,
					},
					southwest: {
						lat: -77.9764,
						lng: 162.8978,
					},
				},
			},
		},
		{
			placeId: 'h7b8gt028yqer4p8i2u4l8q1523x',
			geometry: {
				location: {
					lat: 81.7907,
					lng: -122.3625,
				},
				bounds: {
					northeast: {
						lat: 57.0643,
						lng: 41.4927,
					},
					southwest: {
						lat: -23.0505,
						lng: -39.3423,
					},
				},
				viewport: {
					northeast: {
						lat: -33.6723,
						lng: -93.1541,
					},
					southwest: {
						lat: 44.1207,
						lng: -138.9166,
					},
				},
			},
		},
		{
			placeId: 'f8l6iv834xhqg3a1l1u1o8g8627z',
			geometry: {
				location: {
					lat: 39.8434,
					lng: 129.6737,
				},
				bounds: {
					northeast: {
						lat: -52.1005,
						lng: -62.4799,
					},
					southwest: {
						lat: 63.8332,
						lng: -149.3469,
					},
				},
				viewport: {
					northeast: {
						lat: -6.3549,
						lng: -129.7557,
					},
					southwest: {
						lat: 79.8459,
						lng: -76.0193,
					},
				},
			},
		},
		{
			placeId: 'a6z8nj171pbjb1i1h4z0l9n6755m',
			geometry: {
				location: {
					lat: -50.5558,
					lng: 23.7797,
				},
				bounds: {
					northeast: {
						lat: 74.1964,
						lng: 118.1967,
					},
					southwest: {
						lat: 54.1087,
						lng: -87.3531,
					},
				},
				viewport: {
					northeast: {
						lat: -75.3262,
						lng: -154.521,
					},
					southwest: {
						lat: -24.2494,
						lng: -22.386,
					},
				},
			},
		},
		{
			placeId: 'z5a2ps335usgt1o7m8x1w7o3437t',
			geometry: {
				location: {
					lat: 76.8073,
					lng: 50.0803,
				},
				bounds: {
					northeast: {
						lat: 49.7323,
						lng: 155.707,
					},
					southwest: {
						lat: 0.0818,
						lng: -72.163,
					},
				},
				viewport: {
					northeast: {
						lat: 69.6185,
						lng: 151.8833,
					},
					southwest: {
						lat: 50.9962,
						lng: 142.4655,
					},
				},
			},
		},
		{
			placeId: 'v5k1nh657hijm8u4j1h8y1x8161h',
			geometry: {
				location: {
					lat: 69.4473,
					lng: -23.6272,
				},
				bounds: {
					northeast: {
						lat: 39.6009,
						lng: 24.54,
					},
					southwest: {
						lat: -35.5656,
						lng: 176.7186,
					},
				},
				viewport: {
					northeast: {
						lat: 82.6381,
						lng: 111.7868,
					},
					southwest: {
						lat: -49.6481,
						lng: 9.699,
					},
				},
			},
		},
		{
			placeId: 'j4w6yn512jkqq2r5d3e4y1x3401l',
			geometry: {
				location: {
					lat: -51.2407,
					lng: 76.5857,
				},
				bounds: {
					northeast: {
						lat: 30.0911,
						lng: -10.2653,
					},
					southwest: {
						lat: -29.2937,
						lng: 170.8376,
					},
				},
				viewport: {
					northeast: {
						lat: -32.249,
						lng: 38.4164,
					},
					southwest: {
						lat: -2.2099,
						lng: -150.6011,
					},
				},
			},
		},
		{
			placeId: 'p9z8bo212bcfy0a4c3g2r8m1348p',
			geometry: {
				location: {
					lat: 68.9126,
					lng: -90.3229,
				},
				bounds: {
					northeast: {
						lat: 7.3736,
						lng: -160.7492,
					},
					southwest: {
						lat: -85.8909,
						lng: 8.0029,
					},
				},
				viewport: {
					northeast: {
						lat: -43.2683,
						lng: 43.0401,
					},
					southwest: {
						lat: -52.19,
						lng: 170.7363,
					},
				},
			},
		},
		{
			placeId: 'x8w2pl911vkec1p7n7u9d2w8791r',
			geometry: {
				location: {
					lat: -5.4545,
					lng: 14.1494,
				},
				bounds: {
					northeast: {
						lat: 17.6943,
						lng: -63.1688,
					},
					southwest: {
						lat: -82.3691,
						lng: -84.8036,
					},
				},
				viewport: {
					northeast: {
						lat: -66.5169,
						lng: 58.9635,
					},
					southwest: {
						lat: -28.5722,
						lng: -9.6433,
					},
				},
			},
		},
		{
			placeId: 'e7f1od477hora2l8g2a8g7m4283a',
			geometry: {
				location: {
					lat: -2.1364,
					lng: -120.2015,
				},
				bounds: {
					northeast: {
						lat: 35.1223,
						lng: 10.7898,
					},
					southwest: {
						lat: -64.1741,
						lng: -139.3439,
					},
				},
				viewport: {
					northeast: {
						lat: -28.8087,
						lng: -97.3556,
					},
					southwest: {
						lat: -2.9705,
						lng: -171.4283,
					},
				},
			},
		},
		{
			placeId: 'g1q9vi249jrec3x6e9o8w4k4431e',
			geometry: {
				location: {
					lat: 15.4678,
					lng: -168.9005,
				},
				bounds: {
					northeast: {
						lat: -55.0895,
						lng: -78.9101,
					},
					southwest: {
						lat: -32.5621,
						lng: 35.739,
					},
				},
				viewport: {
					northeast: {
						lat: 78.0048,
						lng: -55.537,
					},
					southwest: {
						lat: -71.0732,
						lng: 46.3503,
					},
				},
			},
		},
		{
			placeId: 'o7y3wu258pdht1n6x4j0g4a4197w',
			geometry: {
				location: {
					lat: -61.233,
					lng: -135.7392,
				},
				bounds: {
					northeast: {
						lat: -22.2146,
						lng: -78.4273,
					},
					southwest: {
						lat: 40.2328,
						lng: -87.0038,
					},
				},
				viewport: {
					northeast: {
						lat: 70.309,
						lng: -38.5593,
					},
					southwest: {
						lat: 1.7198,
						lng: 150.9999,
					},
				},
			},
		},
		{
			placeId: 'm6p4oi095ucwx5l9y3d1b1c7603v',
			geometry: {
				location: {
					lat: -22.0351,
					lng: -84.814,
				},
				bounds: {
					northeast: {
						lat: 46.1084,
						lng: -47.4029,
					},
					southwest: {
						lat: -19.7036,
						lng: -76.4696,
					},
				},
				viewport: {
					northeast: {
						lat: -80.6043,
						lng: -42.4252,
					},
					southwest: {
						lat: 40.3638,
						lng: -147.4568,
					},
				},
			},
		},
		{
			placeId: 'k5m6ra593sdqg1w7p3e1d9z7756b',
			geometry: {
				location: {
					lat: 62.9685,
					lng: -115.1122,
				},
				bounds: {
					northeast: {
						lat: 0.4157,
						lng: 79.0507,
					},
					southwest: {
						lat: 18.67,
						lng: -160.4461,
					},
				},
				viewport: {
					northeast: {
						lat: -71.0917,
						lng: 131.7315,
					},
					southwest: {
						lat: -20.3189,
						lng: 33.8835,
					},
				},
			},
		},
		{
			placeId: 'd5g3tn102yqpd0z3h1q3i7s5164r',
			geometry: {
				location: {
					lat: 57.3995,
					lng: 31.3868,
				},
				bounds: {
					northeast: {
						lat: 20.584,
						lng: 86.4564,
					},
					southwest: {
						lat: 40.6807,
						lng: -111.0425,
					},
				},
				viewport: {
					northeast: {
						lat: -77.1209,
						lng: 83.8166,
					},
					southwest: {
						lat: 6.5259,
						lng: 7.4366,
					},
				},
			},
		},
		{
			placeId: 'm2k9ry579igfc5f8w3i0e5i3346d',
			geometry: {
				location: {
					lat: -64.3959,
					lng: -147.4064,
				},
				bounds: {
					northeast: {
						lat: -6.1004,
						lng: 146.4781,
					},
					southwest: {
						lat: 5.1133,
						lng: -10.7965,
					},
				},
				viewport: {
					northeast: {
						lat: -59.1541,
						lng: -74.4482,
					},
					southwest: {
						lat: -50.1385,
						lng: -41.4244,
					},
				},
			},
		},
		{
			placeId: 'g4e6wh692jwgf2z3f3r6k1l1184w',
			geometry: {
				location: {
					lat: 56.4647,
					lng: -113.4506,
				},
				bounds: {
					northeast: {
						lat: -65.8361,
						lng: -153.1264,
					},
					southwest: {
						lat: 15.4261,
						lng: -111.295,
					},
				},
				viewport: {
					northeast: {
						lat: 13.7961,
						lng: -117.8208,
					},
					southwest: {
						lat: -47.776,
						lng: -168.1263,
					},
				},
			},
		},
		{
			placeId: 'g6p5hz725pqxh9d9x7w6h4z0733x',
			geometry: {
				location: {
					lat: -60.6576,
					lng: -27.9354,
				},
				bounds: {
					northeast: {
						lat: -68.7204,
						lng: -0.6626,
					},
					southwest: {
						lat: -75.6279,
						lng: -17.9185,
					},
				},
				viewport: {
					northeast: {
						lat: -72.915,
						lng: -160.2898,
					},
					southwest: {
						lat: -38.3733,
						lng: -141.4312,
					},
				},
			},
		},
		{
			placeId: 'p7n4pt581bydd6t6j9g4c7b4336c',
			geometry: {
				location: {
					lat: -50.4536,
					lng: 177.5505,
				},
				bounds: {
					northeast: {
						lat: -13.4385,
						lng: -102.1023,
					},
					southwest: {
						lat: 70.4651,
						lng: -127.6315,
					},
				},
				viewport: {
					northeast: {
						lat: 6.6371,
						lng: 119.593,
					},
					southwest: {
						lat: 59.667,
						lng: 34.351,
					},
				},
			},
		},
		{
			placeId: 'o1t5pn583kpeb8e2v2w9i4q4119t',
			geometry: {
				location: {
					lat: -83.6131,
					lng: -44.9859,
				},
				bounds: {
					northeast: {
						lat: 25.6738,
						lng: -77.2356,
					},
					southwest: {
						lat: -4.6663,
						lng: 130.8507,
					},
				},
				viewport: {
					northeast: {
						lat: 54.8933,
						lng: -118.6904,
					},
					southwest: {
						lat: -36.72,
						lng: 112.011,
					},
				},
			},
		},
		{
			placeId: 't7e7ok334xgsh8q3h4q4l2m5824d',
			geometry: {
				location: {
					lat: 30.9855,
					lng: -24.0543,
				},
				bounds: {
					northeast: {
						lat: 13.581,
						lng: 109.9596,
					},
					southwest: {
						lat: -51.1,
						lng: 92.082,
					},
				},
				viewport: {
					northeast: {
						lat: 32.754,
						lng: 1.9596,
					},
					southwest: {
						lat: 34.4076,
						lng: -128.4677,
					},
				},
			},
		},
		{
			placeId: 'y3o8mb567rnjt9v9u3t6e7k6124e',
			geometry: {
				location: {
					lat: 10.328,
					lng: -69.055,
				},
				bounds: {
					northeast: {
						lat: -17.2851,
						lng: -110.0698,
					},
					southwest: {
						lat: 26.9638,
						lng: -47.1316,
					},
				},
				viewport: {
					northeast: {
						lat: 4.4691,
						lng: 135.6165,
					},
					southwest: {
						lat: 72.4854,
						lng: -125.8083,
					},
				},
			},
		},
		{
			placeId: 'b1q5dh343fgqr2w2m5z7r0d3673b',
			geometry: {
				location: {
					lat: 66.0678,
					lng: 12.5426,
				},
				bounds: {
					northeast: {
						lat: -56.45,
						lng: 88.2345,
					},
					southwest: {
						lat: 48.3636,
						lng: -24.6145,
					},
				},
				viewport: {
					northeast: {
						lat: -74.7186,
						lng: -67.787,
					},
					southwest: {
						lat: 83.9225,
						lng: -86.8238,
					},
				},
			},
		},
		{
			placeId: 'r4u6wq218lrbz6i4p8v2q1p4971k',
			geometry: {
				location: {
					lat: -1.4329,
					lng: -123.3681,
				},
				bounds: {
					northeast: {
						lat: 87.8036,
						lng: -164.8523,
					},
					southwest: {
						lat: -74.42,
						lng: -74.5699,
					},
				},
				viewport: {
					northeast: {
						lat: -41.3206,
						lng: 89.0329,
					},
					southwest: {
						lat: -1.1006,
						lng: -114.4768,
					},
				},
			},
		},
	],
}
