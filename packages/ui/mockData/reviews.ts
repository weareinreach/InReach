import { type ApiOutput } from '@weareinreach/api'

import { type ReviewSectionProps } from '~ui/components/sections'

export const reviewsMock = [
	{
		rating: 5,
		user: {
			image: 'https://i.pravatar.cc/50?u=abcdef',
			name: 'User Name',
		},
		createdAt: new Date(2023, 0, 3),
		reviewText:
			"Bicycle rights you probably haven't heard of them tote bag af, lorem hella eu humblebrag gastropub distillery shabby chic poke raclette. Selvage chicharrones skateboard fit. Mustache selvage vinyl coloring book. Af twee beard same scenester 8-bit tempor plaid actually irure. Letterpress eiusmod wayfarers, tonx pop-up exercitation schlitz tumeric gentrify.",
		id: 'orev_LCRREVIEW',
		langConfidence: 100,
		language: null,
		lcrCity: 'Washington',
		lcrCountry: {
			tsKey: 'USA.name',
			tsNs: 'country',
		},
		lcrGovDist: {
			tsKey: 'us-district-of-columbia',
			tsNs: 'gov-dist',
		},
		translatedText: [],
		verifiedUser: true,
	},
	{
		rating: 5,
		user: {
			image: null,
			name: null,
		},
		createdAt: new Date(2022, 11, 30),
		reviewText:
			'Laborum gastropub mukbang, paleo deep v yes plz praxis veniam. 3 wolf moon affogato snackwave gluten-free photo booth. Keytar esse knausgaard seitan waistcoat. Bushwick la croix trust fund cliche dolor pug, 3 wolf moon heirloom cronut listicle jianbing leggings pinterest. Biodiesel edison bulb DSA pariatur lomo fugiat. Cornhole etsy meggings jianbing, swag before they sold out chia tempor. Shaman glossier dolor kitsch deserunt.',
		id: 'orev_REGULARREVIEW',
		langConfidence: 100,
		language: null,
		lcrCity: null,
		lcrCountry: null,
		lcrGovDist: null,
		translatedText: [],
		verifiedUser: false,
	},
	{
		rating: 4,
		user: {
			image: null,
			name: null,
		},
		createdAt: new Date(2022, 4, 2),
		reviewText:
			'Proident Brooklyn vibecession portland migas slow-carb kitsch sus chambray. Butcher small batch subway tile, keytar hoodie authentic fanny pack. Tonx post-ironic literally, yr banjo single-origin coffee craft beer tofu. Praxis taiyaki gluten-free meh.',
		id: 'orev_REGULARREVIEW2',
		langConfidence: 100,
		language: null,
		lcrCity: null,
		lcrCountry: null,
		lcrGovDist: null,
		translatedText: [],
		verifiedUser: false,
	},
	{
		rating: 3,
		user: {
			image: null,
			name: null,
		},
		createdAt: new Date(2023, 1, 5),
		reviewText:
			'Cray street art iceland, next level copper mug id ullamco meditation hoodie chartreuse vexillologist stumptown.',
		id: 'orev_REGULARREVIEW4',
		langConfidence: 100,
		language: null,
		lcrCity: null,
		lcrCountry: null,
		lcrGovDist: null,
		translatedText: [],
		verifiedUser: false,
	},
] satisfies ApiOutput['review']['getByIds']

export const reviewMockIds = reviewsMock.map((review) => ({
	id: review.id,
})) satisfies ReviewSectionProps['reviews']
