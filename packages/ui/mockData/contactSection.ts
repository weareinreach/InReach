import { type ContactSectionProps } from '~ui/components/sections'

export const contactMock = {
	emails: [
		{
			email: {
				email: 'hello@demo.org',
				firstName: null,
				lastName: null,
				legacyDesc: null,
				primary: true,
				description: {
					key: 'email-desc-key',
					ns: 'org-data',
					tsKey: {
						text: 'Default text',
					},
				},
				title: null,
				locationOnly: false,
				serviceOnly: false,
			},
		},
	],
	phones: [
		{
			phone: {
				country: {
					cca2: 'US',
					cca3: 'USA',
					id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
					name: 'United States',
					dialCode: null,
					flag: '🇺🇸',
					tsKey: 'USA.name',
					tsNs: 'country',
				},
				phoneType: null,
				description: {
					key: 'phone-desc-key',
					ns: 'org-data',
					tsKey: {
						text: 'Phone description text',
					},
				},
				phoneLangs: [],
				number: '2025551234',
				ext: null,
				primary: true,
				locationOnly: false,
			},
		},
	],
	socialMedia: [
		{
			service: {
				logoIcon: '',
				name: 'Twitter',
				tsKey: 'twitter',
				tsNs: 'common',
				urlBase: [''],
			},
			url: 'https://twitter.com/userName',
			username: 'userName',
		},
		{
			service: {
				logoIcon: '',
				name: 'Facebook',
				tsKey: 'facebook',
				tsNs: 'common',
				urlBase: [''],
			},
			url: 'https://facebook.com/userName',
			username: 'fbUserName',
		},
	],
	websites: [
		{
			description: {
				key: 'website-desc-key',
				ns: 'org-data',
				tsKey: {
					text: 'Default text',
				},
			},
			id: 'i435uoi3wskljhglk',
			isPrimary: true,
			languages: [
				{
					language: {
						languageName: 'English',
						nativeName: 'English',
					},
				},
			],
			orgLocationId: null,
			orgLocationOnly: false,
			url: 'https://google.com',
		},
		{
			description: {
				key: 'website-desc-key2',
				ns: 'org-data',
				tsKey: {
					text: 'Default text',
				},
			},
			id: 'adskfjawelrjlaksjf',
			isPrimary: false,
			languages: [
				{
					language: {
						languageName: 'English',
						nativeName: 'English',
					},
				},
			],
			orgLocationId: null,
			orgLocationOnly: false,
			url: 'https://maps.google.com',
		},
	],
} satisfies ContactSectionProps['data']

export const singleContactMock = {
	emails: contactMock.emails[0] ? [contactMock.emails[0]] : [],
	phones: contactMock.phones[0] ? [contactMock.phones[0]] : [],
	socialMedia: contactMock.socialMedia[0] ? [contactMock.socialMedia[0]] : [],
	websites: contactMock.websites[0] ? [contactMock.websites[0]] : [],
} satisfies ContactSectionProps['data']
