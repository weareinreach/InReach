import { type LocationCardProps } from '~ui/components/sections'

export const locationMock = {
	govDist: {
		govDistType: {
			tsNs: 'gov-dist',
			tsKey: 'type-district',
		},
		tsKey: 'us-district-of-columbia',
		tsNs: 'gov-dist',
		abbrev: 'DC',
	},
	country: {
		cca2: 'US',
		cca3: 'USA',
		tsKey: 'USA.name',
		tsNs: 'country',
		dialCode: null,
		flag: '🇺🇸',
	},
	attributes: [],
	emails: [],
	websites: [],
	phones: [],
	photos: [],
	reviews: [],
	services: [
		{
			service: {
				description: {
					key: 'whitman-walker-health.osvc_01GSKV973TWEVJWHKJ61Y57773.desc',
					ns: 'org-service',
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community-hiv-aids',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'lang-lang-offered',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								data: null,
							},
						],
					},
					{
						attribute: {
							tsKey: 'sys-incompatible-info',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								data: {
									json: [
										{
											'community-lgbt': 'true',
										},
										{
											'cost-free': 'true',
										},
										{
											'lang-all-languages-by-interpreter': null,
										},
										{
											'has-confidentiality-policy': 'true',
										},
										{
											'elig-age-or-over': '13',
										},
										{
											'time-appointment-required': 'true',
										},
									],
									meta: {
										values: {
											'2.lang-all-languages-by-interpreter': ['undefined'],
										},
									},
								},
							},
						],
					},
				],
				serviceAreas: [
					{
						countries: [],
						districts: [
							{
								govDist: {
									govDistType: {
										tsNs: 'gov-dist',
										tsKey: 'type-district',
									},
									tsKey: 'us-district-of-columbia',
									tsNs: 'gov-dist',
									abbrev: 'DC',
								},
							},
						],
					},
				],
				services: [
					{
						tag: {
							category: {
								tsKey: 'medical.CATEGORYNAME',
								tsNs: 'services',
							},
							defaultAttributes: [],
						},
					},
				],
				accessDetails: [
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslocation',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV973TF5J3AS84GJQDQXJA',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a423f',
												},
												access_type: 'location',
												access_value: '1525 14th St, NW Washington, DC 20005',
												instructions: 'Located at the Whitman-Walker location. Please call.',
											},
										},
									},
								],
							},
						],
					},
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslocation',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV973VAA46AMHEEJ5KWYVM',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '6220d260d99d3c002ee58690',
												},
												access_type: 'location',
												access_value: '2301 MLK Jr., Ave. SE Washington DC 20020',
												instructions: 'Located at the Max Robinson Center. Call to make an appointment.',
											},
										},
									},
								],
							},
						],
					},
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslink',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV973V7XFD5Q3A3EK0WQGP',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '638120c25a2e6c0008bc9728',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/care-program/hiv-care/',
												instructions: 'Visit the webpage for more information.',
											},
										},
									},
								],
							},
						],
					},
				],
				reviews: [],
				phones: [
					{
						phone: {
							country: {
								flag: '🇺🇸',
								dialCode: null,
								cca2: 'US',
								tsKey: 'USA.name',
								tsNs: 'country',
							},
							phoneType: null,
							number: '2027457000',
							ext: null,
							primary: true,
							locationOnly: false,
						},
					},
				],
				emails: [],
			},
		},
		{
			service: {
				description: {
					key: 'whitman-walker-health.osvc_01GSKV9742T9207X6DMR5EHGKB.desc',
					ns: 'org-service',
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community-hiv-aids',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'lang-lang-offered',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								data: null,
							},
						],
					},
					{
						attribute: {
							tsKey: 'sys-incompatible-info',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								data: {
									json: [
										{
											'community-lgbt': 'true',
										},
										{
											'cost-fees': 'Contact for more information on fees.',
										},
										{
											'elig-description':
												'Due to COVID-19, please note that at this time their dental services at Whitman-Walker at 1525 14th Street, NW and Max Robinson Center in Anacostia are not accepting new patients, with the exception of patients who are living with HIV and in need of urgent dental care.',
										},
										{
											'has-confidentiality-policy': 'true',
										},
										{
											'time-appointment-required': 'true',
										},
										{
											'lang-all-languages-by-interpreter': null,
										},
									],
									meta: {
										values: {
											'5.lang-all-languages-by-interpreter': ['undefined'],
										},
									},
								},
							},
						],
					},
				],
				serviceAreas: [
					{
						countries: [],
						districts: [
							{
								govDist: {
									govDistType: {
										tsNs: 'gov-dist',
										tsKey: 'type-district',
									},
									tsKey: 'us-district-of-columbia',
									tsNs: 'gov-dist',
									abbrev: 'DC',
								},
							},
						],
					},
				],
				services: [
					{
						tag: {
							category: {
								tsKey: 'medical.CATEGORYNAME',
								tsNs: 'services',
							},
							defaultAttributes: [],
						},
					},
				],
				accessDetails: [
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accessphone',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV9742050VYZEX8775DS3Z',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a424a',
												},
												access_type: 'phone',
												access_value: ' 202-745-7000',
												instructions: 'Call to make a dental appointment. ',
											},
										},
									},
								],
							},
						],
					},
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslink',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV97420TM4JR5JQ9989Z8B',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a424b',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/dental-health',
												instructions: 'Check the website for details on specific dental services.',
											},
										},
									},
								],
							},
						],
					},
				],
				reviews: [],
				phones: [
					{
						phone: {
							country: {
								flag: '🇺🇸',
								dialCode: null,
								cca2: 'US',
								tsKey: 'USA.name',
								tsNs: 'country',
							},
							phoneType: null,
							number: '2027457000',
							ext: null,
							primary: true,
							locationOnly: false,
						},
					},
				],
				emails: [
					{
						email: {
							title: null,
							firstName: null,
							lastName: null,
							email: 'appointments@whitman-walker.org',
							legacyDesc: 'Schedule An Appointment ',
							description: null,
						},
					},
				],
			},
		},
		{
			service: {
				description: {
					key: 'whitman-walker-health.osvc_01GSKV97439FQYEMMV1ST1J4RN.desc',
					ns: 'org-service',
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community-adults',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-bisexual',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-gay',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-gender-nonconforming',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-hiv-aids',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-lesbian',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-lgbtq-youth',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-nonbinary',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-queer',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-teens',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-transgender',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-trans-youth',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'lang-lang-offered',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								data: null,
							},
						],
					},
					{
						attribute: {
							tsKey: 'sys-incompatible-info',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								data: {
									json: [
										{
											'community-lgbt': 'true',
										},
										{
											'has-confidentiality-policy': 'true',
										},
										{
											'time-appointment-required': 'true',
										},
										{
											'lang-all-languages-by-interpreter': null,
										},
										{
											'cost-free': 'true',
										},
									],
									meta: {
										values: {
											'3.lang-all-languages-by-interpreter': ['undefined'],
										},
									},
								},
							},
						],
					},
				],
				serviceAreas: [
					{
						countries: [],
						districts: [
							{
								govDist: {
									govDistType: {
										tsNs: 'gov-dist',
										tsKey: 'type-district',
									},
									tsKey: 'us-district-of-columbia',
									tsNs: 'gov-dist',
									abbrev: 'DC',
								},
							},
						],
					},
				],
				services: [
					{
						tag: {
							category: {
								tsKey: 'mental-health.CATEGORYNAME',
								tsNs: 'services',
							},
							defaultAttributes: [],
						},
					},
					{
						tag: {
							category: {
								tsKey: 'mental-health.CATEGORYNAME',
								tsNs: 'services',
							},
							defaultAttributes: [],
						},
					},
				],
				accessDetails: [
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslink',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV97432VN90BJV978SG3RM',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '638139daf0ecf90008c64890',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/behavioral-health/',
												instructions: 'Visit the website for more information and a full list of services.',
											},
										},
									},
								],
							},
						],
					},
				],
				reviews: [],
				phones: [],
				emails: [],
			},
		},
		{
			service: {
				description: {
					key: 'whitman-walker-health.osvc_01GSKV974DKH1RTA3MQ4JZKEFA.desc',
					ns: 'org-service',
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community-transgender',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community-trans-youth',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'lang-lang-offered',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								data: null,
							},
						],
					},
					{
						attribute: {
							tsKey: 'sys-incompatible-info',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								data: {
									json: [
										{
											'community-lgbt': 'true',
										},
										{
											'cost-fees': 'Contact for more information on fees.',
										},
										{
											'elig-description':
												'If someone is working with them who is under the age of 18, they will require a mental health assessment as well as parental or guardian consent.',
										},
										{
											'has-confidentiality-policy': 'true',
										},
										{
											'lang-all-languages-by-interpreter': null,
										},
										{
											'time-appointment-required': 'true',
										},
										{
											'req-proof-of-age': 'true',
										},
										{
											'req-photo-id': 'true',
										},
										{
											'service-city-district-of-columbia-washington': 'true',
										},
									],
									meta: {
										values: {
											'4.lang-all-languages-by-interpreter': ['undefined'],
										},
									},
								},
							},
						],
					},
				],
				serviceAreas: [
					{
						countries: [],
						districts: [
							{
								govDist: {
									govDistType: {
										tsNs: 'gov-dist',
										tsKey: 'type-district',
									},
									tsKey: 'us-district-of-columbia',
									tsNs: 'gov-dist',
									abbrev: 'DC',
								},
							},
						],
					},
				],
				services: [
					{
						tag: {
							category: {
								tsKey: 'medical.CATEGORYNAME',
								tsNs: 'services',
							},
							defaultAttributes: [],
						},
					},
				],
				accessDetails: [
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accessphone',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV974DY902DYR7N2CZF4QW',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a424d',
												},
												access_type: 'phone',
												access_value: '202-797-4457',
												instructions: 'Call for more information about their Gender Affirming Services.',
											},
										},
									},
								],
							},
						],
					},
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslink',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV974DTD839E5A94C899Q3',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a424e',
												},
												access_type: 'link',
												access_value:
													'https://www.whitman-walker.org/care-program/transgender-care-hormone-therapy-ht-hrt',
												instructions:
													"Visit the website to learn more about Whitman-Walker Health's gender affirming hormone therapy. ",
											},
										},
									},
								],
							},
						],
					},
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accessemail',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV974D47QBSHEERVMHPTB5',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '5e953b4def07fe001758d6b1',
												},
												access_type: 'email',
												access_value: 'Transhealth@whitman-walker.org',
												instructions: 'Email for more information about their Gender Affirming Services.',
											},
										},
									},
								],
							},
						],
					},
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslocation',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV974D767RB2H3XKPWH98A',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '63388c28b155890016f14daf',
												},
												access_type: 'location',
												access_value:
													'Whitman-Walker at 1525\n1525 14th St, NW Washington, DC 20005\n\nand\n\nMax Robinson Center\n2301 MLK Jr., Ave. SE Washington DC 20020',
												instructions:
													'Gender affirming hormone therapy services are offered at the Whitman-Walker at 1525 and Max Robinson Center locations. ',
											},
										},
									},
								],
							},
						],
					},
				],
				reviews: [],
				phones: [
					{
						phone: {
							country: {
								flag: '🇺🇸',
								dialCode: null,
								cca2: 'US',
								tsKey: 'USA.name',
								tsNs: 'country',
							},
							phoneType: null,
							number: '2027974457',
							ext: null,
							primary: false,
							locationOnly: false,
						},
					},
				],
				emails: [
					{
						email: {
							title: null,
							firstName: null,
							lastName: null,
							email: 'Transhealth@whitman-walker.org',
							legacyDesc: 'Gender Affirming Services',
							description: null,
						},
					},
				],
			},
		},
		{
			service: {
				description: {
					key: 'whitman-walker-health.osvc_01GSKV974EC3S5D0K87BC62R1M.desc',
					ns: 'org-service',
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community-hiv-aids',
							tsNs: 'attribute',
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'lang-lang-offered',
							tsNs: 'attribute',
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								data: null,
							},
						],
					},
				],
				serviceAreas: [
					{
						countries: [],
						districts: [
							{
								govDist: {
									govDistType: {
										tsNs: 'gov-dist',
										tsKey: 'type-district',
									},
									tsKey: 'us-district-of-columbia',
									tsNs: 'gov-dist',
									abbrev: 'DC',
								},
							},
						],
					},
				],
				services: [
					{
						tag: {
							category: {
								tsKey: 'medical.CATEGORYNAME',
								tsNs: 'services',
							},
							defaultAttributes: [],
						},
					},
				],
				accessDetails: [
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslink',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV974F61K6BZXGKH30137N',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '638121baa354a20008c9f5a2',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/care-program/prep/',
												instructions: 'Visit the link to learn more about PrEP and access services.',
											},
										},
									},
								],
							},
						],
					},
					{
						attributes: [
							{
								attribute: {
									tsKey: 'serviceaccess-accesslink',
									tsNs: 'attribute',
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GSKV974FWT0QER9B8K2VA24K',
											ns: 'org-service',
										},
										data: {
											json: {
												_id: {
													$oid: '638121d2a354a20008c9f5a4',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/care-program/pep/',
												instructions: 'Visit the link to learn more about PEP and access services.',
											},
										},
									},
								],
							},
						],
					},
				],
				reviews: [],
				phones: [],
				emails: [],
			},
		},
	],
	serviceAreas: [],
	socialMedia: [],
	name: 'Whitman-Walker 1525',
	street1: '1525 14th St. NW ',
	street2: '',
	city: 'Washington',
	postCode: '20005',
	primary: true,
	longitude: -77.032,
	latitude: 38.91,
} satisfies LocationCardProps['location']
