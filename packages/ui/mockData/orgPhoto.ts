import { getTRPCMock, type MockDataObject, type MockHandlerObject } from '~ui/lib/getTrpcMock'

export const orgPhotoData = {
	getByParent: [
		{
			id: 'opto_01GW2HTA78QEM7QQCHQHQDHZ7D',
			src: 'https://fastly.4sqi.net/img/general/300x300/842405_vs0swjE8OEtAkzWyR5w0aveLmOb8yLTm423NIQNUGtw.jpg',
			height: 192,
			width: 192,
		},
		{
			id: 'opto_01GW2HTA78R7G11YQDK51HJZD4',
			src: 'https://fastly.4sqi.net/img/general/300x300/72996168_ohYvz_SNrumUOIQ39NBrBSBQsb9mH0F8wFp_YCEj2B0.jpg',
			height: 192,
			width: 192,
		},
		{
			id: 'opto_01GW2HTA780XY9A36SQF089S0T',
			src: 'https://fastly.4sqi.net/img/general/300x300/16156_DrGSoE806kcnmWou8BKqeSdzyg4bCkk5VTDw2ETbc0Y.jpg',
			height: 192,
			width: 192,
		},
		{
			id: 'opto_01GW2HTA783T3W7DQKSB7BBSV5',
			src: 'https://fastly.4sqi.net/img/general/300x300/842405_KYR_c3I84HvC3XWPOLeYIouBCpSpWMjrDqgc9ODrrKg.jpg',
			height: 192,
			width: 192,
		},
		{
			id: 'opto_01GW2HTA78QW9DAT94JGCFPTHW',
			src: 'https://fastly.4sqi.net/img/general/300x300/8588378_1UqeD58opqKIqI02HIyVYExC3rs8fxr1cfITOSFel2A.jpg',
			height: 289,
			width: 289,
		},
		{
			id: 'opto_01GW2HTA786G8HX5J5ZX6FFMG5',
			src: 'https://fastly.4sqi.net/img/general/300x300/63477693_nyM4Nwf1oKvlhNQ2ae3QUnTBRgScBIfrAuGBhQueXxE.jpg',
			height: 192,
			width: 192,
		},
		{
			id: 'opto_01GW2HTA78Q2HWH4YZDCHEZZVQ',
			src: 'https://fastly.4sqi.net/img/general/300x300/34968821_FIfZPBDcdR6xrh0lzro0ch3rJffjP092IqX_jX-AsU4.jpg',
			height: 192,
			width: 192,
		},
	],
} satisfies MockDataObject<'orgPhoto'>

export const orgPhoto = {
	getByParent: getTRPCMock({
		path: ['orgPhoto', 'getByParent'],
		response: orgPhotoData.getByParent,
	}),
} satisfies MockHandlerObject<'orgPhoto'>
