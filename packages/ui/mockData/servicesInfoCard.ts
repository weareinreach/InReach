import { type ServicesInfoCardProps } from '~ui/components/sections'

export const servicesMock = [
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620DP9YS29RSDFR5KPG9V.description',
				ns: 'org-data',
				tsKey: {
					text: 'Whitman-Walker provides walk-in HIV testing at multiple locations in DC. Walk-in HIV testing includes a confidential, rapid HIV test and risk-reduction counseling. The counseling provides clients with education on their options for having safer sex. Whitman-Walker uses the INSTI® HIV-1/HIV-2 Rapid Antibody Test and results take one minute.',
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.hiv-aids',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
										'has-confidentiality-policy': 'true',
									},
									{
										'time-walk-in': 'true',
									},
									{
										'lang-all-languages-by-interpreter': null,
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
						showOnLocation: null,
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DPZAY77SC8GTXYV2QQ',
										ns: 'org-data',
										tsKey: {
											text: 'Max Robinson Center - NO walk-in testing is available. Monday: 08:30-12:30, 13:30-17:30; Tuesday: 08:30 - 12:30, 13:30 - 17:30; Wednesday: 08:30 - 12:30, 13:30 - 17:30; Thursday: 08:30 - 12:30, 13:30 - 17:30; Friday: 08:30 - 12:30, 14:15 - 17:30.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4231',
											},
											access_type: 'location',
											access_value: '2301 M. Luther King Jr., Washington DC 20020',
											instructions:
												'Max Robinson Center - NO walk-in testing is available. Monday: 08:30-12:30, 13:30-17:30; Tuesday: 08:30 - 12:30, 13:30 - 17:30; Wednesday: 08:30 - 12:30, 13:30 - 17:30; Thursday: 08:30 - 12:30, 13:30 - 17:30; Friday: 08:30 - 12:30, 14:15 - 17:30.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DP96QPMZ654YP9VXWS',
										ns: 'org-data',
										tsKey: {
											text: 'Whitman-Walker at 1525 - NO walk-in testing is available. Monday-Thursday: 08:30-12:30 & 13:30-17:30; Friday: 08:30- 12:30 & 14:30 -17:30.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4233',
											},
											access_type: 'location',
											access_value: '1525 14th St, NW Washington, DC 20005',
											instructions:
												'Whitman-Walker at 1525 - NO walk-in testing is available. Monday-Thursday: 08:30-12:30 & 13:30-17:30; Friday: 08:30- 12:30 & 14:30 -17:30.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DQ0AJ8X82FYMCQ70K7',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website to learn more about Whitman-Walker's testing hours and locations.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4234',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/hiv-sti-testing',
											instructions:
												"Visit the website to learn more about Whitman-Walker's testing hours and locations. ",
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
								tsKey: 'serviceaccess.accessphone',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DQ4C38XP3P3CEKVQJF',
										ns: 'org-data',
										tsKey: {
											text: 'Contact the Main Office about services offered in multiple languages upon request.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4235',
											},
											access_type: 'phone',
											access_value: '202-745-7000',
											instructions:
												'Contact the Main Office about services offered in multiple languages upon request. ',
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
			id: 'osvc_01GVC620DP9YS29RSDFR5KPG9V',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620DRDAHE84TN57RM1DGF.description',
				ns: 'org-data',
				tsKey: {
					text: 'Whitman-Walker offers a wide variety of gender affirming services, including: Gender Affirming Hormone Therapy; Trans Care Navigation; Care Navigation; HIV & STI Testing and Counseling; HIV Specialty Care; Gynecology; Breast Health Initiative; Name and Gender Change; and Gender Affirming Counseling & Assessment.',
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.adults',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.teens',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.trans-youth',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.transgender',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
											"Offered to individuals connected to Whitman-Walker Health's medical services.",
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
						showOnLocation: null,
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
						name: 'Trans Health - Hormone and Surgery Letters',
						tsKey: 'medical.trans-health-hormone-and-surgery-letters',
						tsNs: 'services',
						category: {
							tsKey: 'medical.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
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
				{
					tag: {
						name: 'Name and gender change',
						tsKey: 'legal.name-and-gender-change',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Trans support groups',
						tsKey: 'mental-health.trans-support-groups',
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
						name: 'Trans Health - Primary Care',
						tsKey: 'medical.trans-health-primary-care',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DRNB8VFBS9BM0CAEQ1',
										ns: 'org-data',
										tsKey: {
											text: 'Call for more information about their Gender Affirming Services.',
										},
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
								tsKey: 'serviceaccess.accesslink',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DSAG59X8GAKFGWGXGK',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website to learn more about Whitman-Walker Health's gender affirming services.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a424e',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/transgender-care-and-services/',
											instructions:
												"Visit the website to learn more about Whitman-Walker Health's gender affirming services. ",
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DS4WFHJCMQ93TNM6AC',
										ns: 'org-data',
										tsKey: {
											text: 'Email for more information about their Gender Affirming Services.',
										},
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
			id: 'osvc_01GVC620DRDAHE84TN57RM1DGF',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620DTZ1KK232H8WDWT5G2.description',
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
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
				{
					attribute: {
						tsKey: 'lang.lang-offered',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DTCGF4PRE0WFMNS7HG',
										ns: 'org-data',
										tsKey: {
											text: 'Located at the Whitman-Walker location. Please call.',
										},
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
								tsKey: 'serviceaccess.accesslocation',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DT8QSH44AFM6YKSJDC',
										ns: 'org-data',
										tsKey: {
											text: 'Located at the Max Robinson Center. Call to make an appointment.',
										},
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
								tsKey: 'serviceaccess.accesslink',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DVFD3CHR6YFCEM6KQT',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the webpage for more information.',
										},
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
			id: 'osvc_01GVC620DTZ1KK232H8WDWT5G2',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620DWRRJEFYYXMZJXWYTG.description',
				ns: 'org-data',
				tsKey: {
					text: 'Whitman-Walker Health Youth Services are about education, prevention and helping you understand your health needs. From free HIV/STI/pregnancy testing to lessons on safer sex, their youth team will answer all your questions. Youth Mental Health services are open to all young person ages 13-24 who have experienced or witnessed something that is difficult to talk about (i.e. crime). RealTalkDC is their main youth program. It connects you to free health resources and offers a safe space for you to express yourself. RealTalkDC provides inclusive sexual health education for young people ages 13-24 through presentations in schools and programing at the RealTalkDC Peer Education Center.',
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.hiv-aids',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.lgbtq-youth',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.teens',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.trans-youth',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.transgender',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
										'elig-age-range': '13-24',
									},
									{
										'lang-all-languages-by-interpreter': null,
									},
									{
										'has-confidentiality-policy': 'true',
									},
									{
										'service-state-washington-dc': null,
									},
								],
								meta: {
									values: {
										'5.service-state-washington-dc': ['undefined'],
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
						showOnLocation: null,
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
			serviceAreas: [],
			services: [
				{
					tag: {
						name: 'Cultural centers',
						tsKey: 'community-support.cultural-centers',
						tsNs: 'services',
						category: {
							tsKey: 'community-support.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'LGBTQ centers',
						tsKey: 'community-support.lgbtq-centers',
						tsNs: 'services',
						category: {
							tsKey: 'community-support.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
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
			],
			accessDetails: [
				{
					attributes: [
						{
							attribute: {
								tsKey: 'serviceaccess.accessphone',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DW6RYW28WW2DZJWC24',
										ns: 'org-data',
										tsKey: {
											text: 'Call for more information on youth services or RealTalkDC.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e953f72ef07fe001758d763',
											},
											access_type: 'phone',
											access_value: '202-543-9355',
											instructions: 'Call for more information on youth services or RealTalkDC.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DWNWCWDR440627P2F0',
										ns: 'org-data',
										tsKey: {
											text: 'Their Youth Services location is open Monday - Friday 11:00-19:00 (11:00-18:00 on the second Friday of the month) in Eastern Market. No appointments are needed. Testing is walk-in only, but you must arrive no later than 18:45 (17:45 on the second Friday of the month). Stop by and visit them sometime.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e953f9fef07fe001758d766',
											},
											access_type: 'location',
											instructions:
												'Their Youth Services location is open Monday - Friday 11:00-19:00 (11:00-18:00 on the second Friday of the month) in Eastern Market. No appointments are needed. Testing is walk-in only, but you must arrive no later than 18:45 (17:45 on the second Friday of the month). Stop by and visit them sometime.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DXFPG8JBGCA5372R5V',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the website for more information.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '63811d75c8831900089591f1',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/youth-services/',
											instructions: 'Visit the website for more information.',
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
						number: '2025439355',
						ext: null,
						primary: false,
						locationOnly: false,
					},
				},
			],
			emails: [],
			id: 'osvc_01GVC620DWRRJEFYYXMZJXWYTG',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620DYF6EWQ6B23GDBZ0XC.description',
				ns: 'org-data',
				tsKey: {
					text: 'Youth Mental Health services provide individual and group therapy for young people ages 13-24 with a specific focus on trauma recovery, LGBTQ identities and other life challenges. These services are free and available to young people who have experienced or witnessed a crime (no police report required). The program provides low-barrier mental health support to maintain overall wellbeing. This program strives to provide young people a safe and affirming space to explore their own individual capacities for healing. Therapists use a wide array of techniques, from art to music to sand play in session; they tailor sessions to meet the young person’s specific needs. Therapy can be provided at any Whitman-Walker Health location or at other locations in the community.',
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.lgbtq-youth',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.trans-youth',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
										'community-transitional-age-youth': 'true',
									},
									{
										'cost-free': 'true',
									},
									{
										'has-confidentiality-policy': 'true',
									},
									{
										'time-appointment-required': 'true',
									},
									{
										'elig-description':
											'Available to LGBTQ young people ages 13-24 who have experienced or witnessed a crime (no police report required).',
									},
									{
										'elig-age-range': '13-24',
									},
									{
										'lang-all-languages-by-interpreter': null,
									},
								],
								meta: {
									values: {
										'7.lang-all-languages-by-interpreter': ['undefined'],
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
						showOnLocation: null,
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
						name: 'LGBTQ centers',
						tsKey: 'community-support.lgbtq-centers',
						tsNs: 'services',
						category: {
							tsKey: 'community-support.CATEGORYNAME',
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
			],
			accessDetails: [
				{
					attributes: [
						{
							attribute: {
								tsKey: 'serviceaccess.accessemail',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DZJ4Y2E3P7C85MBR1Z',
										ns: 'org-data',
										tsKey: {
											text: 'Email if you have questions or would like to schedule a screening.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e953a81ef07fe001758d6a1',
											},
											access_type: 'email',
											access_value: 'youthmentalhealth@whitman-walker.org',
											instructions: 'Email if you have questions or would like to schedule a screening.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620DZHZ4JVAXFKWC63XAD',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the link to learn more about youth mental health services.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '6220d48ed99d3c002ee586ac',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/care-program/youth-mental-health/',
											instructions: 'Visit the link to learn more about youth mental health services.',
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
			emails: [
				{
					email: {
						title: null,
						firstName: null,
						lastName: null,
						email: 'youthmentalhealth@whitman-walker.org',
						legacyDesc: 'Youth Mental Health Services',
						description: null,
						primary: false,
					},
				},
			],
			id: 'osvc_01GVC620DYF6EWQ6B23GDBZ0XC',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620E0CYEK4ZQK7KTYFTWV.description',
				ns: 'org-data',
				tsKey: {
					text: 'The legal team at Whitman-Walker can advise on a variety of immigration issues, including: asylum, adjustment, naturalization, employment authorization document (EAD), family petitions, advance parole, refugee travel documents, re-entry permits, DACA, temporary protected status, U-visas, T-visas, VAWA petitions, removal defense, special immigrant juvenile status, and certificates of citizenship.',
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.citizens',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.asylum-seeker',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.africa-immigrant',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.asia-immigrant',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.latin-america-immigrant',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.middle-east-immigrant',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.residents-green-card-holders',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.unaccompanied-minors',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.undocumented',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
										'lang-all-languages-by-interpreter': null,
									},
									{
										'community-russia-immigrant': 'true',
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
						showOnLocation: null,
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
						name: 'Asylum application',
						tsKey: 'legal.asylum-application',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Deferred Action for Childhood Arrivals (DACA)',
						tsKey: 'legal.deferred-action-for-childhood-arrivals-daca',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Employment Authorization',
						tsKey: 'legal.employment-authorization',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Citizenship',
						tsKey: 'legal.citizenship',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Crime and discrimination',
						tsKey: 'legal.crime-and-discrimination',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Family Petitions',
						tsKey: 'legal.family-petitions',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Residency',
						tsKey: 'legal.residency',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'Special Immigrant Juvenile Status (SIJS)',
						tsKey: 'legal.special-immigrant-juvenile-status-sijs',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'U Visa',
						tsKey: 'legal.u-visa',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
							tsNs: 'services',
						},
						defaultAttributes: [],
					},
				},
				{
					tag: {
						name: 'T Visa',
						tsKey: 'legal.t-visa',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E0DSNA38GNY2XCZJNA',
										ns: 'org-data',
										tsKey: {
											text: "Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4241',
											},
											access_type: 'phone',
											access_value: '202-939-7630',
											instructions:
												"Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you. ",
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E153RTCJY0ZGJHASFF',
										ns: 'org-data',
										tsKey: {
											text: 'Walk-in appointments are available at Whitman-Walker 1525, Monday through Friday, 9:00 to 17:00.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4243',
											},
											access_type: 'location',
											access_value: '1525 14th St, NW Washington, DC 20005',
											instructions:
												'Walk-in appointments are available at Whitman-Walker 1525, Monday through Friday, 9:00 to 17:00.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E1S0NJECDBZQEDA20F',
										ns: 'org-data',
										tsKey: {
											text: 'Walk-in appointments are available at Max Robinson Center Monday through Friday 9:00 to 17:00.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4244',
											},
											access_type: 'location',
											access_value: '2301 M. Luther King Jr., Washington DC 20020',
											instructions:
												'Walk-in appointments are available at Max Robinson Center Monday through Friday 9:00 to 17:00.',
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
								tsKey: 'serviceaccess.accessphone',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E136XQJH3HGP7N5CJE',
										ns: 'org-data',
										tsKey: {
											text: 'Contact the Main Office about services offered in multiple languages upon request.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4245',
											},
											access_type: 'phone',
											access_value: '202-745-7000',
											instructions:
												'Contact the Main Office about services offered in multiple languages upon request. ',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E1SKRXKV11C8K3XRTF',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4246',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/care-program/legal-services-immigration',
											instructions:
												"Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E2KXNZ9CQ8HMJGS6JB',
										ns: 'org-data',
										tsKey: {
											text: 'Walk-in appointments are available at WeWork, Monday through Friday, 9:00 to 17:00.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4247',
											},
											access_type: 'location',
											access_value: '1377 R St. NW, Washington, DC 20009',
											instructions:
												'Walk-in appointments are available at WeWork, Monday through Friday, 9:00 to 17:00.',
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
						number: '2029397630',
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
						email: 'contact-legal@whitman-walker.org',
						legacyDesc: 'Legal Services Program',
						description: null,
						primary: false,
					},
				},
			],
			id: 'osvc_01GVC620E0CYEK4ZQK7KTYFTWV',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620E3GE9HRJ8RJG9JYR9K.description',
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
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
				{
					attribute: {
						tsKey: 'lang.lang-offered',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E3F7PXEJ6XPASNYBDH',
										ns: 'org-data',
										tsKey: {
											text: 'Call to make a dental appointment.',
										},
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
								tsKey: 'serviceaccess.accesslink',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E3MWAAJDPGDGNE2VB9',
										ns: 'org-data',
										tsKey: {
											text: 'Check the website for details on specific dental services.',
										},
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
						primary: true,
					},
				},
			],
			id: 'osvc_01GVC620E3GE9HRJ8RJG9JYR9K',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620E4B3KZMARAGFKMY2NC.description',
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
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.bisexual',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.gay',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.hiv-aids',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.gender-nonconforming',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.lesbian',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.lgbtq-youth',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.queer',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.nonbinary',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.teens',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.trans-youth',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.transgender',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
				{
					attribute: {
						tsKey: 'lang.lang-offered',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
			],
			accessDetails: [
				{
					attributes: [
						{
							attribute: {
								tsKey: 'serviceaccess.accesslink',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620E4EEX2YTAFN2Q3R5FZ',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the website for more information and a full list of services.',
										},
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
			id: 'osvc_01GVC620E4B3KZMARAGFKMY2NC',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620EBEA12XS55VF2ZF116.description',
				ns: 'org-data',
				tsKey: {
					text: 'The legal team at Whitman-Walker provides help to Whitman-Walker patients, people living with HIV, and members of the Lesbian, Gay, Bisexual, Transgender, and Queer communities. Note that due to the high demand for immigration legal assistance, Whitman-Walker may provide only referral information. The legal team can advise on a variety of immigration issues, including: applications for transgender clients to replace and update name/gender marker on immigration documents including work permits, green cards, citizenship/naturalization certificates, and travel documents.',
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.asylum-seeker',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.africa-immigrant',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.asylee',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.hiv-aids',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.latin-america-immigrant',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.middle-east-immigrant',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.transgender',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
										'has-confidentiality-policy': 'true',
									},
									{
										'elig-description': 'transgender immigrants',
									},
									{
										'lang-all-languages-by-interpreter': null,
									},
									{
										'community-russia-immigrant': 'true',
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
						showOnLocation: null,
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
						name: 'Name and gender change',
						tsKey: 'legal.name-and-gender-change',
						tsNs: 'services',
						category: {
							tsKey: 'legal.CATEGORYNAME',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EBYZ7ZBJJCJ6REN28T',
										ns: 'org-data',
										tsKey: {
											text: "Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a426d',
											},
											access_type: 'phone',
											access_value: '202-939-7630',
											instructions:
												"Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you.",
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EC74PEWBVCAY0A5E6R',
										ns: 'org-data',
										tsKey: {
											text: "Email the Whitman-Walker Health's legal team for help with this legal issue.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a426e',
											},
											access_type: 'email',
											access_value: '',
											instructions:
												"Email the Whitman-Walker Health's legal team for help with this legal issue.",
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620ECQDP22FCRXV80AG92',
										ns: 'org-data',
										tsKey: {
											text: 'Appointments are available at Whitman-Walker 1525, Monday through Thursday, 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:30-17:00.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a426f',
											},
											access_type: 'location',
											access_value: '1525 14th St, NW Washington, DC 20005',
											instructions:
												'Appointments are available at Whitman-Walker 1525, Monday through Thursday, 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:30-17:00.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620ECB48F77NZGADDQHV5',
										ns: 'org-data',
										tsKey: {
											text: 'Appointments are available at Max Robinson Center Monday through Thursday 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:15-17:30.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4270',
											},
											access_type: 'location',
											access_value: '2301 M. Luther King Jr., Washington DC 20020',
											instructions:
												'Appointments are available at Max Robinson Center Monday through Thursday 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:15-17:30.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620ED0KMYV2TTKKN64JDS',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4272',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/care-program/legal-services-immigration',
											instructions:
												"Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EDMV2MKMFH4JFQAD27',
										ns: 'org-data',
										tsKey: {
											text: 'Appointments are available at Whitman-Walker at LIZ Mondays & Wednesdays 09:00 –12:15 pm & 13:45 – 16:30; Tuesdays & Thursdays 09:00 – 12:15 &  13:45 – 17:30.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '6220dbf0d99d3c002ee5870b',
											},
											access_type: 'location',
											access_value: '1377 R St, NW, Suite 200 Washington, DC 20009',
											instructions:
												'Appointments are available at Whitman-Walker at LIZ Mondays & Wednesdays 09:00 –12:15 pm & 13:45 – 16:30; Tuesdays & Thursdays 09:00 – 12:15 &  13:45 – 17:30.',
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
						number: '2029397630',
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
						email: 'contact-legal@whitman-walker.org',
						legacyDesc: 'Legal Services Program',
						description: null,
						primary: false,
					},
				},
			],
			id: 'osvc_01GVC620EBEA12XS55VF2ZF116',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620EJJKAD0JXD621SVVBJ.description',
				ns: 'org-data',
				tsKey: {
					text: 'Whitman-Walker Health encourages you to get your COVID-19 vaccine or booster as soon as possible. New cases of COVID-19 are increasing rapidly. Whitman-Walker has the COVID-19 vaccine available. *Please note, if you get your first COVID-19 vaccine dose or full series at a location other than Whitman-Walker, you can schedule your 2nd dose, 3rd dose or booster shot through Whitman-Walker.',
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.adults',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.teens',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [
						{
							country: null,
							language: null,
							text: null,
							data: {
								json: [
									{
										'service-city-district-of-columbia-washington': 'true',
									},
									{
										'lang-all-languages-by-interpreter': null,
									},
									{
										'has-confidentiality-policy': 'true',
									},
									{
										'time-appointment-required': 'true',
									},
									{
										'cost-free': 'true',
									},
									{
										'cost-fees': 'The vaccine will be free.',
									},
								],
								meta: {
									values: {
										'1.lang-all-languages-by-interpreter': ['undefined'],
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
						showOnLocation: null,
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
						name: 'COVID-19 services',
						tsKey: 'medical.covid-19-services',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EJH9YXA493NHJC36E2',
										ns: 'org-data',
										tsKey: {
											text: 'Call Whitman-Walker Health to schedule a vaccine appointment.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '61fa9e3f706e5300349c36cb',
											},
											access_type: 'phone',
											access_value: '202-207-2480',
											instructions: 'Call Whitman-Walker Health to schedule a vaccine appointment.',
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
								tsKey: 'serviceaccess.accessphone',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EKJ6BT38JYDMHSTF3Z',
										ns: 'org-data',
										tsKey: {
											text: 'You can also text Whitman-Walker Health to schedule a vaccine appointment.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '61fa9e5f706e5300349c36cd',
											},
											access_type: 'phone',
											access_value: '202-978-6123',
											instructions:
												'You can also text Whitman-Walker Health to schedule a vaccine appointment.',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EKH68BAGJM5N8D5X0W',
										ns: 'org-data',
										tsKey: {
											text: "See Whitman-Walker Health's website for more information.",
										},
									},
									data: {
										json: {
											_id: {
												$oid: '61fa9f9b706e5300349c36f6',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/blogs-and-stories/covid-19-vaccine-faq/',
											instructions: "See Whitman-Walker Health's website for more information. ",
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
						number: '2022072480',
						ext: null,
						primary: false,
						locationOnly: false,
					},
				},
			],
			emails: [],
			id: 'osvc_01GVC620EJJKAD0JXD621SVVBJ',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620EMTG508FP95V92MR9P.description',
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
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.transgender',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
				{
					attribute: {
						tsKey: 'lang.lang-offered',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EMRXNJVNVDVYSQQ6S5',
										ns: 'org-data',
										tsKey: {
											text: 'Call for more information about their Gender Affirming Services.',
										},
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
								tsKey: 'serviceaccess.accesslink',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EMQNT2GXS7SP92XBYE',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website to learn more about Whitman-Walker Health's gender affirming hormone therapy.",
										},
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
								tsKey: 'serviceaccess.accessemail',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620ENKM14SVXH0C45PM78',
										ns: 'org-data',
										tsKey: {
											text: 'Email for more information about their Gender Affirming Services.',
										},
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
								tsKey: 'serviceaccess.accesslocation',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620ENGSJH5GH2ZFJ098GT',
										ns: 'org-data',
										tsKey: {
											text: 'Gender affirming hormone therapy services are offered at the Whitman-Walker at 1525 and Max Robinson Center locations.',
										},
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
						primary: false,
					},
				},
			],
			id: 'osvc_01GVC620EMTG508FP95V92MR9P',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620EPWF5B1EM6G2C0DDFD.description',
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
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'lang.lang-offered',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EPDCTVC0VA9DDBQ2TK',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the link to learn more about PrEP and access services.',
										},
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
								tsKey: 'serviceaccess.accesslink',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EQB4VME07CSV1BADRF',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the link to learn more about PEP and access services.',
										},
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
			id: 'osvc_01GVC620EPWF5B1EM6G2C0DDFD',
		},
	},
	{
		service: {
			description: {
				key: 'whitman-walker-health.osvc_01GVC620EQ9KXNCEYKJBHKBFMZ.description',
				ns: 'org-data',
				tsKey: {
					text: "Whitman-Walker's team is here to talk with you about your health insurance options and any problems you are having with insurance or the cost of your care. They will meet with any Whitman-Walker patient who doesn’t have insurance to see what they qualify for and to help them enroll.",
				},
			},
			hours: [],
			attributes: [
				{
					attribute: {
						tsKey: 'community.adults',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.seniors',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'community.teens',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [],
				},
				{
					attribute: {
						tsKey: 'sys.incompatible-info',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
					},
					supplement: [
						{
							country: null,
							language: null,
							text: null,
							data: {
								json: [
									{
										'req-photo-id': 'true',
									},
									{
										'req-proof-of-residence': 'true',
									},
									{
										'req-proof-of-income': 'true',
									},
								],
							},
						},
					],
				},
				{
					attribute: {
						tsKey: 'lang.lang-offered',
						tsNs: 'attribute',
						icon: null,
						showOnLocation: null,
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
						name: 'Medical clinics',
						tsKey: 'medical.medical-clinics',
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
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620EQZJQERMW07FB54V43',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the website for more information and a full list of services offered.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '638123a0ad300f00082447ff',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/insurance-navigation-services/',
											instructions:
												'Visit the website for more information and a full list of services offered.',
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
								tsKey: 'serviceaccess.accessphone',
								tsNs: 'attribute',
								icon: null,
								showOnLocation: null,
							},
							supplement: [
								{
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GVC620ER7KTCHMH71P4QHY6R',
										ns: 'org-data',
										tsKey: {
											text: 'Call the Insurance Help Line with any questions.',
										},
									},
									data: {
										json: {
											_id: {
												$oid: '638124a0ad300f0008244803',
											},
											access_type: 'phone',
											access_value: '202-745-6151',
											instructions: 'Call the Insurance Help Line with any questions.',
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
			id: 'osvc_01GVC620EQ9KXNCEYKJBHKBFMZ',
		},
	},
] satisfies ServicesInfoCardProps['services']
