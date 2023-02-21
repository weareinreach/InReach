import { Meta, StoryObj } from '@storybook/react'

import { UserReview } from './UserReview'
import { StorybookGrid } from '../layout/BodyGrid'

export default {
	title: 'Design System/User Review',
	component: UserReview,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A7027&t=sleVeGl2lJv7Df18-4',
		},
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof UserReview>

type StoryDef = StoryObj<typeof UserReview>

export const VerifiedWithNameAndPicture = {
	args: {
		user: {
			image: 'https://i.pravatar.cc/50?u=abcdef',
			name: 'User Name',
		},
		reviewDate: new Date(2023, 0, 3),
		reviewText:
			"Bicycle rights you probably haven't heard of them tote bag af, lorem hella eu humblebrag gastropub distillery shabby chic poke raclette. Selvage chicharrones skateboard fit. Mustache selvage vinyl coloring book. Af twee beard same scenester 8-bit tempor plaid actually irure. Letterpress eiusmod wayfarers, tonx pop-up exercitation schlitz tumeric gentrify.",
		verifiedUser: true,
	},
} satisfies StoryDef

export const VerifiedWithNameOnly = {
	args: {
		user: {
			name: 'User NoPic',
		},
		reviewDate: new Date(2022, 11, 30),
		reviewText:
			'Laborum gastropub mukbang, paleo deep v yes plz praxis veniam. 3 wolf moon affogato snackwave gluten-free photo booth. Keytar esse knausgaard seitan waistcoat. Bushwick la croix trust fund cliche dolor pug, 3 wolf moon heirloom cronut listicle jianbing leggings pinterest. Biodiesel edison bulb DSA pariatur lomo fugiat. Cornhole etsy meggings jianbing, swag before they sold out chia tempor. Shaman glossier dolor kitsch deserunt.',
		verifiedUser: true,
	},
} satisfies StoryDef

export const UnverifiedAnonymous = {
	args: {
		reviewDate: new Date(2022, 4, 2),
		reviewText:
			'Proident Brooklyn vibecession portland migas slow-carb kitsch sus chambray. Butcher small batch subway tile, keytar hoodie authentic fanny pack. Tonx post-ironic literally, yr banjo single-origin coffee craft beer tofu. Praxis taiyaki gluten-free meh. ',
		verifiedUser: false,
	},
} satisfies StoryDef

export const UnverifiedShortWithNameAndPicture = {
	args: {
		user: {
			image: 'https://i.pravatar.cc/50?u=1234567',
			name: 'User ShortReview',
		},
		reviewDate: new Date(2023, 1, 5),
		reviewText:
			'Cray street art iceland, next level copper mug id ullamco meditation hoodie chartreuse vexillologist stumptown. ',
		verifiedUser: true,
	},
} satisfies StoryDef

export const UnverifiedWithNameAndPicture = {
	args: {
		user: {
			image: 'https://i.pravatar.cc/50?u=12345674',
			name: 'User Unverified',
		},
		reviewDate: new Date(2022, 10, 25),
		reviewText:
			'Skateboard selfies actually magna aliqua, adaptogen exercitation hot chicken church-key pitchfork art party pop-up plaid pour-over viral. Locavore next level in lomo. Neutra velit slow-carb waistcoat chia, duis meditation letterpress offal irure. Ascot duis yr 8-bit.',
		verifiedUser: false,
	},
} satisfies StoryDef

export const LoadingState = {
	args: {
		user: {
			image: 'https://i.pravatar.cc/50?u=12345674',
			name: 'User Unverified',
		},
		reviewDate: new Date(2022, 10, 25),
		reviewText:
			'Skateboard selfies actually magna aliqua, adaptogen exercitation hot chicken church-key pitchfork art party pop-up plaid pour-over viral. Locavore next level in lomo. Neutra velit slow-carb waistcoat chia, duis meditation letterpress offal irure. Ascot duis yr 8-bit.',
		verifiedUser: false,
		forceLoading: true,
	},
} satisfies StoryDef
