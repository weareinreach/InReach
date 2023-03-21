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
	hours: [],
	reviews: [],
	services: [
		{
			service: {
				serviceName: {
					key: 'whitman-walker-health.osvc_01GVH3VEVSNF9NH79R7HC9FHY6.name',
					ns: 'org-data',
					tsKey: {
						text: 'Get HIV care for newly diagnosed patients',
					},
				},
				description: {
					key: 'whitman-walker-health.osvc_01GVH3VEVSNF9NH79R7HC9FHY6.description',
					ns: 'org-data',
					tsKey: {
						text: "Whitman-Walker's Red Carpet program is their HIV Specialty Care program for people newly diagnosed with HIV or new to HIV care. Red Carpet is their way of connecting people living with HIV to medical care in a smooth and fast transition that fits easily into daily life. If you have insurance, please call us at 202.745.7000 and mention “Red Carpet.” Their staff will let you know whether they accept your insurance plan and will help you schedule an appointment. If you do not have insurance, please contact their Public Benefits & Insurance Navigation team at 202.745.6151.",
					},
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community.hiv-aids',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'sys.incompatible-info',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'system',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								govDist: null,
								boolean: null,
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
					{
						attribute: {
							tsKey: 'lang.lang-offered',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'languages',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								govDist: null,
								boolean: null,
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
							name: 'HIV and sexual health',
							tsKey: 'medical.hiv-and-sexual-health',
							tsNs: 'services',
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
									tsKey: 'serviceaccess.accesslocation',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNABVVEQER6F1YDHN7176',
											ns: 'org-data',
											tsKey: {
												text: 'Located at the Whitman-Walker location. Please call.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a423f',
												},
												access_type: 'location',
												access_value: '1525 14th St, NW Washington, DC 20005',
												instructions: 'Located at the Whitman-Walker location. Please call.',
												access_value_ES: '1525 14th St, NW Washington, DC 20005',
												instructions_ES: 'Ubicado en la ubicación de Whitman-Walker. Por favor llama.',
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
									tsKey: 'serviceaccess.accesslocation',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNABW7KQJEF273S43WEEH',
											ns: 'org-data',
											tsKey: {
												text: 'Located at the Max Robinson Center. Call to make an appointment.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '6220d260d99d3c002ee58690',
												},
												access_type: 'location',
												access_value: '2301 MLK Jr., Ave. SE Washington DC 20020',
												instructions: 'Located at the Max Robinson Center. Call to make an appointment.',
												access_value_ES: '2301 MLK Jr., Ave. SE Washington DC 20020',
												instructions_ES: 'Ubicado en el Centro Max Robinson. Llama para hacer una cita.',
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
									tsKey: 'serviceaccess.accesslink',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNABWE903JYJ4MWE3CTNH',
											ns: 'org-data',
											tsKey: {
												text: 'Visit the webpage for more information.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '638120c25a2e6c0008bc9728',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/care-program/hiv-care/',
												instructions: 'Visit the webpage for more information.',
												access_value_ES: 'https://www.whitman-walker.org/care-program/hiv-care/',
												instructions_ES: 'Visita la página web para obtener más información.',
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
				userLists: [],
				id: 'osvc_01GVH3VEVSNF9NH79R7HC9FHY6',
			},
		},
		{
			service: {
				serviceName: {
					key: 'whitman-walker-health.osvc_01GVH3VEW2ND36DB0XWAH1PQY0.name',
					ns: 'org-data',
					tsKey: {
						text: 'Get dental health services for HIV-positive individuals',
					},
				},
				description: {
					key: 'whitman-walker-health.osvc_01GVH3VEW2ND36DB0XWAH1PQY0.description',
					ns: 'org-data',
					tsKey: {
						text: 'Whitman-Walker Health offers preventive and restorative dental health services including dental exam, teeth cleaning, mouth guard, orthodontics, prosthodontics, restorative treatment, root canal, scaling and root planing, tooth extraction, teeth whitening.',
					},
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community.hiv-aids',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'sys.incompatible-info',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'system',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								govDist: null,
								boolean: null,
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
					{
						attribute: {
							tsKey: 'lang.lang-offered',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'languages',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								govDist: null,
								boolean: null,
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
							name: 'Dental care',
							tsKey: 'medical.dental-care',
							tsNs: 'services',
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
									tsKey: 'serviceaccess.accessphone',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNAC37R59WJV0PX2BE99F',
											ns: 'org-data',
											tsKey: {
												text: 'Call to make a dental appointment.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a424a',
												},
												access_type: 'phone',
												access_value: ' 202-745-7000',
												instructions: 'Call to make a dental appointment. ',
												access_value_ES: ' 202-745-7000',
												instructions_ES: 'Llama para hacer una cita dental.',
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
									tsKey: 'serviceaccess.accesslink',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNAC40GBD14WSYTPJ6BCH',
											ns: 'org-data',
											tsKey: {
												text: 'Check the website for details on specific dental services.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a424b',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/dental-health',
												instructions: 'Check the website for details on specific dental services.',
												access_value_ES: 'https://www.whitman-walker.org/dental-health',
												instructions_ES:
													'Visita el sitio web para obtener detalles sobre servicios dentales específicos.',
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
							primary: true,
						},
					},
				],
				userLists: [],
				id: 'osvc_01GVH3VEW2ND36DB0XWAH1PQY0',
			},
		},
		{
			service: {
				serviceName: {
					key: 'whitman-walker-health.osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z.name',
					ns: 'org-data',
					tsKey: {
						text: 'Receive behavioral health services',
					},
				},
				description: {
					key: 'whitman-walker-health.osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z.description',
					ns: 'org-data',
					tsKey: {
						text: "Whitman-Walker's Behavioral Health programs include peer support, substance use treatment, psychotherapy, psychiatry, and gender affirming assessment. They offer services to adults and youth. The behavioral healthcare team includes licensed psychotherapists (social workers, professional counselors, and marriage and family therapists, psychologists), psychiatric providers (medical doctors and nurse practitioners), and highly trained peers and graduate interns. The assessment and referral process will get you started and will help them determine together which services are right for you.",
					},
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community.adults',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.bisexual',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.gender-nonconforming',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.hiv-aids',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.gay',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.lesbian',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.lgbtq-youth',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.nonbinary',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.queer',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.teens',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.trans-youth',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.transgender',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'sys.incompatible-info',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'system',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								govDist: null,
								boolean: null,
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
					{
						attribute: {
							tsKey: 'lang.lang-offered',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'languages',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								govDist: null,
								boolean: null,
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
							name: 'Support groups',
							tsKey: 'mental-health.support-groups',
							tsNs: 'services',
							category: {
								tsKey: 'mental-health.CATEGORYNAME',
								tsNs: 'services',
							},
							defaultAttributes: [],
						},
					},
					{
						tag: {
							name: 'Private therapy and counseling',
							tsKey: 'mental-health.private-therapy-and-counseling',
							tsNs: 'services',
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
									tsKey: 'serviceaccess.accesslink',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNAC5E8ZD1NMHV0C76PHA',
											ns: 'org-data',
											tsKey: {
												text: 'Visit the website for more information and a full list of services.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '638139daf0ecf90008c64890',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/behavioral-health/',
												instructions: 'Visit the website for more information and a full list of services.',
												access_value_ES: 'https://www.whitman-walker.org/behavioral-health/',
												instructions_ES:
													'Visita el sitio web para obtener más información y una lista completa de servicios.',
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
				userLists: [],
				id: 'osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z',
			},
		},
		{
			service: {
				serviceName: {
					key: 'whitman-walker-health.osvc_01GVH3VEWHDC6F5FCQHB0H5GD6.name',
					ns: 'org-data',
					tsKey: {
						text: 'Get gender affirming hormone therapy',
					},
				},
				description: {
					key: 'whitman-walker-health.osvc_01GVH3VEWHDC6F5FCQHB0H5GD6.description',
					ns: 'org-data',
					tsKey: {
						text: 'Your medical provider (e.g. a doctor, nurse practitioner or physician assistant) will work with you to understand your goals and needs before prescribing medication. Whitman-Walker will follow an informed consent model for gender affirming hormone therapy with people ages 18+. If someone is working with them who is under the age of 18, Whitman-Walker will require a mental health assessment as well as parental or guardian consent.',
					},
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community.trans-youth',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'community.transgender',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'sys.incompatible-info',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'system',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: null,
								text: null,
								govDist: null,
								boolean: null,
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
					{
						attribute: {
							tsKey: 'lang.lang-offered',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'languages',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								govDist: null,
								boolean: null,
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
							name: 'Trans Health - Hormone Therapy',
							tsKey: 'medical.trans-health-hormone-therapy',
							tsNs: 'services',
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
									tsKey: 'serviceaccess.accessphone',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNACAC6191GM2HGQSQDJZ',
											ns: 'org-data',
											tsKey: {
												text: 'Call for more information about their Gender Affirming Services.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '5e7e4bdbd54f1760921a424d',
												},
												access_type: 'phone',
												access_value: '202-797-4457',
												instructions: 'Call for more information about their Gender Affirming Services.',
												access_value_ES: '202-797-4457',
												instructions_ES:
													'Llama para obtener más información sobre sus servicios de afirmación de género.',
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
									tsKey: 'serviceaccess.accesslink',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNACB3VXFJTM2E2V5YMM2',
											ns: 'org-data',
											tsKey: {
												text: "Visit the website to learn more about Whitman-Walker Health's gender affirming hormone therapy.",
											},
										},
										govDist: null,
										boolean: null,
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
												access_value_ES:
													'https://www.whitman-walker.org/care-program/transgender-care-hormone-therapy-ht-hrt',
												instructions_ES:
													'Visita el sitio web para obtener más información sobre la terapia hormonal de afirmación de género de Whitman-Walker Health.',
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
									tsKey: 'serviceaccess.accessemail',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNACB2KY5GE6K9V2PCRDT',
											ns: 'org-data',
											tsKey: {
												text: 'Email for more information about their Gender Affirming Services.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '5e953b4def07fe001758d6b1',
												},
												access_type: 'email',
												access_value: 'Transhealth@whitman-walker.org',
												instructions: 'Email for more information about their Gender Affirming Services.',
												access_value_ES: 'Transhealth@whitman-walker.org',
												instructions_ES:
													'Envía un correo electrónico para obtener más información sobre sus servicios de afirmación de género.',
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
									tsKey: 'serviceaccess.accesslocation',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNACB1QRE0VMGQCQ2MEAD',
											ns: 'org-data',
											tsKey: {
												text: 'Gender affirming hormone therapy services are offered at the Whitman-Walker at 1525 and Max Robinson Center locations.',
											},
										},
										govDist: null,
										boolean: null,
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
												access_value_ES: 'Whitman-Walker at 1525\n1525 14th St, NW Washington, DC 20005\n',
												instructions_ES:
													'Los servicios de terapia hormonal de afirmación de género se ofrecen en las ubicaciones de Whitman-Walker en 1525 y Max Robinson Center.',
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
							primary: false,
						},
					},
				],
				userLists: [],
				id: 'osvc_01GVH3VEWHDC6F5FCQHB0H5GD6',
			},
		},
		{
			service: {
				serviceName: {
					key: 'whitman-walker-health.osvc_01GVH3VEWK33YAKZMQ2W3GT4QK.name',
					ns: 'org-data',
					tsKey: {
						text: 'Access PEP and PrEP',
					},
				},
				description: {
					key: 'whitman-walker-health.osvc_01GVH3VEWK33YAKZMQ2W3GT4QK.description',
					ns: 'org-data',
					tsKey: {
						text: 'Whitman-Walker offers access to both PEP and PrEP. PEP is a 28-day course of medication that should be used only in emergency situations and must be started within 72 hours after a recent, possible exposure to HIV. If you think you’ve recently been exposed to HIV during sex or through sharing needles and works to prepare drugs, or if you’ve been sexually assaulted, please call them at 202.797.4439 right away. “PrEP” stands for Pre-Exposure Prophylaxis. It is an FDA-approved once-a-day prevention pill for people who don’t have HIV but who have a greater exposure to HIV through sex or other behaviors. When taken every day, PrEP is up to 99% effective at preventing an HIV infection that is transmitted through sex. PrEP does not prevent other STIs or pregnancy. You can use PrEP with other prevention methods, like condoms, to offer more protection as PrEP. For PrEP to work effectively, people who use it must take it every day as prescribed and follow up with their doctor or medical team member every 3 months for routine screening and discussion of barriers to adherence.',
					},
				},
				hours: [],
				attributes: [
					{
						attribute: {
							tsKey: 'community.hiv-aids',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'community',
										icon: null,
									},
								},
							],
						},
						supplement: [],
					},
					{
						attribute: {
							tsKey: 'lang.lang-offered',
							tsNs: 'attribute',
							icon: null,
							iconBg: null,
							showOnLocation: null,
							categories: [
								{
									category: {
										tag: 'languages',
										icon: null,
									},
								},
							],
						},
						supplement: [
							{
								country: null,
								language: {
									languageName: 'English',
									nativeName: 'English',
								},
								text: null,
								govDist: null,
								boolean: null,
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
							name: 'HIV and sexual health',
							tsKey: 'medical.hiv-and-sexual-health',
							tsNs: 'services',
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
									tsKey: 'serviceaccess.accesslink',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNACC9C6R4HYCYEXTFP11',
											ns: 'org-data',
											tsKey: {
												text: 'Visit the link to learn more about PrEP and access services.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '638121baa354a20008c9f5a2',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/care-program/prep/',
												instructions: 'Visit the link to learn more about PrEP and access services.',
												access_value_ES: 'https://www.whitman-walker.org/care-program/prep/',
												instructions_ES:
													'Visita el enlace para obtener más información sobre PrEP y acceder a los servicios.',
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
									tsKey: 'serviceaccess.accesslink',
									tsNs: 'attribute',
									icon: null,
									iconBg: null,
									showOnLocation: null,
									categories: [
										{
											category: {
												tag: 'service-access-instructions',
												icon: null,
											},
										},
									],
								},
								supplement: [
									{
										country: null,
										language: null,
										text: {
											key: 'whitman-walker-health.attribute.atts_01GVXZNACCDWPHW3FQKEV1P6PK',
											ns: 'org-data',
											tsKey: {
												text: 'Visit the link to learn more about PEP and access services.',
											},
										},
										govDist: null,
										boolean: null,
										data: {
											json: {
												_id: {
													$oid: '638121d2a354a20008c9f5a4',
												},
												access_type: 'link',
												access_value: 'https://www.whitman-walker.org/care-program/pep/',
												instructions: 'Visit the link to learn more about PEP and access services.',
												access_value_ES: 'https://www.whitman-walker.org/care-program/pep/',
												instructions_ES:
													'Visita el enlace para obtener más información sobre PEP y acceder a los servicios.',
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
				userLists: [],
				id: 'osvc_01GVH3VEWK33YAKZMQ2W3GT4QK',
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
	id: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
} satisfies LocationCardProps['location']
