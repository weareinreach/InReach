import { type ServicesInfoCardProps } from '~ui/components/sections'

export const servicesMock = [
	{
		service: {
			serviceName: {
				key: 'whitman-walker-health.osvc_01GVH3VEVPF1KEKBTRVTV70WGV.name',
				ns: 'org-data',
				tsKey: {
					text: 'Get rapid HIV testing',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEVPF1KEKBTRVTV70WGV.description',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABQ2G9XADBV1S016V5B',
										ns: 'org-data',
										tsKey: {
											text: 'Max Robinson Center - NO walk-in testing is available. Monday: 08:30-12:30, 13:30-17:30; Tuesday: 08:30 - 12:30, 13:30 - 17:30; Wednesday: 08:30 - 12:30, 13:30 - 17:30; Thursday: 08:30 - 12:30, 13:30 - 17:30; Friday: 08:30 - 12:30, 14:15 - 17:30.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4231',
											},
											access_type: 'location',
											access_value: '2301 M. Luther King Jr., Washington DC 20020',
											instructions:
												'Max Robinson Center - NO walk-in testing is available. Monday: 08:30-12:30, 13:30-17:30; Tuesday: 08:30 - 12:30, 13:30 - 17:30; Wednesday: 08:30 - 12:30, 13:30 - 17:30; Thursday: 08:30 - 12:30, 13:30 - 17:30; Friday: 08:30 - 12:30, 14:15 - 17:30.',
											access_value_ES: '2301 M. Luther King Jr., Washington DC 20020',
											instructions_ES:
												'Centro Max Robinson: NO hay pruebas disponibles sin cita previa. Lunes: 08:30-12:30, 13:30-17:30; Martes: 08:30 - 12:30, 13:30 - 17:30; Miércoles: 08:30 - 12:30, 13:30 - 17:30; Jueves: 08:30 - 12:30, 13:30 - 17:30; Viernes: 08:30 - 12:30, 14:15 - 17:30.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABR9P4QJM7F4JRVQ2M5',
										ns: 'org-data',
										tsKey: {
											text: 'Whitman-Walker at 1525 - NO walk-in testing is available. Monday-Thursday: 08:30-12:30 & 13:30-17:30; Friday: 08:30- 12:30 & 14:30 -17:30.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4233',
											},
											access_type: 'location',
											access_value: '1525 14th St, NW Washington, DC 20005',
											instructions:
												'Whitman-Walker at 1525 - NO walk-in testing is available. Monday-Thursday: 08:30-12:30 & 13:30-17:30; Friday: 08:30- 12:30 & 14:30 -17:30.',
											access_value_ES: '1525 14th St, NW Washington, DC 20005',
											instructions_ES:
												'Whitman-Walker en 1525: NO hay pruebas disponibles. Lunes-Jueves: 08:30-12:30 y 13:30-17:30; Viernes: 08:30- 12:30 y 14:30 -17:30.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABRFNECSGS4FVC016WA',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website to learn more about Whitman-Walker's testing hours and locations.",
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4234',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/hiv-sti-testing',
											instructions:
												"Visit the website to learn more about Whitman-Walker's testing hours and locations. ",
											access_value_ES: 'https://www.whitman-walker.org/hiv-sti-testing',
											instructions_ES:
												'Visita el sitio web para obtener más información sobre los horarios y lugares de prueba de Whitman-Walker.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABRDH6SEAG847DQEPR4',
										ns: 'org-data',
										tsKey: {
											text: 'Contact the Main Office about services offered in multiple languages upon request.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4235',
											},
											access_type: 'phone',
											access_value: '202-745-7000',
											instructions:
												'Contact the Main Office about services offered in multiple languages upon request. ',
											access_value_ES: '202-745-7000',
											instructions_ES:
												'Comunícate con la oficina principal sobre los servicios que se ofrecen en varios idiomas si lo solicitas.',
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
			id: 'osvc_01GVH3VEVPF1KEKBTRVTV70WGV',
		},
	},
	{
		service: {
			serviceName: {
				key: 'whitman-walker-health.osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ.name',
				ns: 'org-data',
				tsKey: {
					text: 'Receive gender affirming care and services',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ.description',
				ns: 'org-data',
				tsKey: {
					text: 'Whitman-Walker offers a wide variety of gender affirming services, including: Gender Affirming Hormone Therapy; Trans Care Navigation; Care Navigation; HIV & STI Testing and Counseling; HIV Specialty Care; Gynecology; Breast Health Initiative; Name and Gender Change; and Gender Affirming Counseling & Assessment.',
				},
			},
			hours: [
				{
					dayIndex: 1,
					start: new Date('1970-01-01T12:30:00.000Z'),
					end: new Date('1970-01-01T21:30:00.000Z'),
					closed: false,
					tz: 'America/New_York',
				},
				{
					dayIndex: 2,
					start: new Date('1970-01-01T12:30:00.000Z'),
					end: new Date('1970-01-01T21:30:00.000Z'),
					closed: false,
					tz: 'America/New_York',
				},
				{
					dayIndex: 3,
					start: new Date('1970-01-01T12:30:00.000Z'),
					end: new Date('1970-01-01T21:30:00.000Z'),
					closed: false,
					tz: 'America/New_York',
				},
				{
					dayIndex: 4,
					start: new Date('1970-01-01T12:30:00.000Z'),
					end: new Date('1970-01-01T21:30:00.000Z'),
					closed: false,
					tz: 'America/New_York',
				},
				{
					dayIndex: 5,
					start: new Date('1970-01-01T12:30:00.000Z'),
					end: new Date('1970-01-01T21:00:00.000Z'),
					closed: false,
					tz: 'America/New_York',
				},
			],
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABS9MWXHAANHH2SE3BP',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABTBPY8JZQ0XK68360B',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website to learn more about Whitman-Walker Health's gender affirming services.",
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
											access_value: 'https://www.whitman-walker.org/transgender-care-and-services/',
											instructions:
												"Visit the website to learn more about Whitman-Walker Health's gender affirming services. ",
											access_value_ES: 'https://www.whitman-walker.org/transgender-care-and-services/',
											instructions_ES:
												'Visita el sitio web para obtener más información sobre los servicios de afirmación de género de Whitman-Walker Health.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABTCT1TCRQ5AD55RWC5',
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
			id: 'osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ',
		},
	},
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
				key: 'whitman-walker-health.osvc_01GVH3VEVVHBRF1FFXZGMMYG7D.name',
				ns: 'org-data',
				tsKey: {
					text: 'Access youth and family support services',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEVVHBRF1FFXZGMMYG7D.description',
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
			serviceAreas: [],
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABXBYAPTVKF274CK0YZ',
										ns: 'org-data',
										tsKey: {
											text: 'Call for more information on youth services or RealTalkDC.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e953f72ef07fe001758d763',
											},
											access_type: 'phone',
											access_value: '202-543-9355',
											instructions: 'Call for more information on youth services or RealTalkDC.',
											access_value_ES: '202-543-9355',
											instructions_ES:
												'Llama para obtener más información sobre los servicios para jóvenes o RealTalkDC.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABX7XT5YGX3GQQCKGW7',
										ns: 'org-data',
										tsKey: {
											text: 'Their Youth Services location is open Monday - Friday 11:00-19:00 (11:00-18:00 on the second Friday of the month) in Eastern Market. No appointments are needed. Testing is walk-in only, but you must arrive no later than 18:45 (17:45 on the second Friday of the month). Stop by and visit them sometime.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e953f9fef07fe001758d766',
											},
											access_type: 'location',
											instructions:
												'Their Youth Services location is open Monday - Friday 11:00-19:00 (11:00-18:00 on the second Friday of the month) in Eastern Market. No appointments are needed. Testing is walk-in only, but you must arrive no later than 18:45 (17:45 on the second Friday of the month). Stop by and visit them sometime.',
											instructions_ES:
												'Su ubicación de Servicios Juveniles está abierta de lunes a viernes de 11:00 a 19:00 (11:00 a 18:00 el segundo viernes del mes) en Eastern Market. No se necesitan citas. Las pruebas son solo sin cita previa, pero debe llegar a más tardar a las 18:45 (17:45 el segundo viernes del mes). Pásate y visítales alguna vez.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABY9ZYDCRN469YARBNV',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the website for more information.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '63811d75c8831900089591f1',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/youth-services/',
											instructions: 'Visit the website for more information.',
											access_value_ES: 'https://www.whitman-walker.org/youth-services/',
											instructions_ES: 'Visita el sitio web para obtener más información.',
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
			userLists: [],
			id: 'osvc_01GVH3VEVVHBRF1FFXZGMMYG7D',
		},
	},
	{
		service: {
			serviceName: {
				key: 'whitman-walker-health.osvc_01GVH3VEVY24KAYTWY2ZSFZNBX.name',
				ns: 'org-data',
				tsKey: {
					text: 'Get free individual and group psychotherapy for LGBTQ young people (ages 13-24)',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEVY24KAYTWY2ZSFZNBX.description',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNABZ82XX2RQM7VCD78S7',
										ns: 'org-data',
										tsKey: {
											text: 'Email if you have questions or would like to schedule a screening.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e953a81ef07fe001758d6a1',
											},
											access_type: 'email',
											access_value: 'youthmentalhealth@whitman-walker.org',
											instructions: 'Email if you have questions or would like to schedule a screening.',
											access_value_ES: 'youthmentalhealth@whitman-walker.org',
											instructions_ES:
												'Envía un correo electrónico si tiene preguntas o desea programar una evaluación.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC0FCEAHJBMYSJ9G4X6',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the link to learn more about youth mental health services.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '6220d48ed99d3c002ee586ac',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/care-program/youth-mental-health/',
											instructions: 'Visit the link to learn more about youth mental health services.',
											access_value_ES: 'https://www.whitman-walker.org/care-program/youth-mental-health/',
											instructions_ES:
												'Visita el enlace para obtener más información sobre los servicios de salud mental para jóvenes.',
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
			userLists: [],
			id: 'osvc_01GVH3VEVY24KAYTWY2ZSFZNBX',
		},
	},
	{
		service: {
			serviceName: {
				key: 'whitman-walker-health.osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC.name',
				ns: 'org-data',
				tsKey: {
					text: 'Get legal help with immigration services',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC.description',
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
						tsKey: 'community.asylum-seeker',
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
						tsKey: 'community.africa-immigrant',
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
						tsKey: 'community.asia-immigrant',
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
						tsKey: 'community.latin-america-immigrant',
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
						tsKey: 'community.middle-east-immigrant',
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
						tsKey: 'community.residents-green-card-holders',
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
						tsKey: 'community.undocumented',
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
						tsKey: 'community.unaccompanied-minors',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC117RB5M50SJ4EBHAD',
										ns: 'org-data',
										tsKey: {
											text: "Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you.",
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4241',
											},
											access_type: 'phone',
											access_value: '202-939-7630',
											instructions:
												"Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you. ",
											access_value_ES: '202-939-7630',
											instructions_ES:
												'Llama al equipo legal de Whitman-Walker Health para obtener ayuda con este problema legal. Su personal de admisión hablará contigo por teléfono para ver si pueden ayudarte.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC1PVDR4VBD71TC97FC',
										ns: 'org-data',
										tsKey: {
											text: 'Walk-in appointments are available at Whitman-Walker 1525, Monday through Friday, 9:00 to 17:00.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4243',
											},
											access_type: 'location',
											access_value: '1525 14th St, NW Washington, DC 20005',
											instructions:
												'Walk-in appointments are available at Whitman-Walker 1525, Monday through Friday, 9:00 to 17:00.',
											access_value_ES: '1525 14th St, NW Washington, DC 20005',
											instructions_ES:
												'Las citas sin cita están disponibles en Whitman-Walker 1525, de lunes a viernes, de 9:00 a 17:00.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC20VHJD1HSWXXD4DNK',
										ns: 'org-data',
										tsKey: {
											text: 'Walk-in appointments are available at Max Robinson Center Monday through Friday 9:00 to 17:00.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4244',
											},
											access_type: 'location',
											access_value: '2301 M. Luther King Jr., Washington DC 20020',
											instructions:
												'Walk-in appointments are available at Max Robinson Center Monday through Friday 9:00 to 17:00.',
											access_value_ES: '2301 M. Luther King Jr., Washington DC 20020',
											instructions_ES:
												'Las citas sin cita están disponibles en Max Robinson Center de lunes a viernes de 9:00 a 17:00.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC2FYN81F5YEAVX4AMQ',
										ns: 'org-data',
										tsKey: {
											text: 'Contact the Main Office about services offered in multiple languages upon request.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4245',
											},
											access_type: 'phone',
											access_value: '202-745-7000',
											instructions:
												'Contact the Main Office about services offered in multiple languages upon request. ',
											access_value_ES: '202-745-7000',
											instructions_ES:
												'Comunícate con la oficina principal sobre los servicios que se ofrecen en varios idiomas si lo solicitas.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC2TKE6WJNMXMSJ1R79',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4246',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/care-program/legal-services-immigration',
											instructions:
												"Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
											access_value_ES:
												'https://www.whitman-walker.org/care-program/legal-services-immigration',
											instructions_ES:
												'Visita el sitio web para obtener más información sobre cómo el equipo legal de Whitman-Walker Health puede ayudar con los problemas de inmigración.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC205MHB1Q6EXX4R2MR',
										ns: 'org-data',
										tsKey: {
											text: 'Walk-in appointments are available at WeWork, Monday through Friday, 9:00 to 17:00.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4247',
											},
											access_type: 'location',
											access_value: '1377 R St. NW, Washington, DC 20009',
											instructions:
												'Walk-in appointments are available at WeWork, Monday through Friday, 9:00 to 17:00.',
											access_value_ES: '1377 R St. NW, Washington, DC 20009',
											instructions_ES:
												'Las citas sin cita están disponibles en WeWork, de lunes a viernes, de 9:00 a 17:00.',
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
			userLists: [],
			id: 'osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC',
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
				key: 'whitman-walker-health.osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG.name',
				ns: 'org-data',
				tsKey: {
					text: 'Get legal help for transgender people to replace and update name/gender marker on immigration documents',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG.description',
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
						tsKey: 'community.africa-immigrant',
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
						tsKey: 'community.asylee',
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
						tsKey: 'community.latin-america-immigrant',
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
						tsKey: 'community.middle-east-immigrant',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC6FSP60JGC76T5TZWP',
										ns: 'org-data',
										tsKey: {
											text: "Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you.",
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a426d',
											},
											access_type: 'phone',
											access_value: '202-939-7630',
											instructions:
												"Call the Whitman-Walker Health's legal team for help with this legal issue. Their intake staff will talk with you over the phone to see if they can help you.",
											access_value_ES: '202-939-7630',
											instructions_ES:
												'Llama al equipo legal de Whitman-Walker Health para obtener ayuda con este problema legal. Su personal de admisión hablará contigo por teléfono para ver si pueden ayudarte.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC6AKQQ1Z4401ESFJ7M',
										ns: 'org-data',
										tsKey: {
											text: "Email the Whitman-Walker Health's legal team for help with this legal issue.",
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a426e',
											},
											access_type: 'email',
											access_value: '',
											instructions:
												"Email the Whitman-Walker Health's legal team for help with this legal issue.",
											instructions_ES:
												'Envía un correo electrónico al equipo legal de Whitman-Walker Health para obtener ayuda con este problema legal.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC79DKNW4ST8SPGYK3N',
										ns: 'org-data',
										tsKey: {
											text: 'Appointments are available at Whitman-Walker 1525, Monday through Thursday, 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:30-17:00.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a426f',
											},
											access_type: 'location',
											access_value: '1525 14th St, NW Washington, DC 20005',
											instructions:
												'Appointments are available at Whitman-Walker 1525, Monday through Thursday, 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:30-17:00.',
											access_value_ES: '1525 14th St, NW Washington, DC 20005',
											instructions_ES:
												'Las citas están disponibles en Whitman-Walker 1525, de lunes a jueves, de 08:30 a 12:30 y de 13:30 a 17:30; y viernes 08:30-12:30 y 14:30-17:00.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC7XTC19VTRT6P0KZWZ',
										ns: 'org-data',
										tsKey: {
											text: 'Appointments are available at Max Robinson Center Monday through Thursday 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:15-17:30.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4270',
											},
											access_type: 'location',
											access_value: '2301 M. Luther King Jr., Washington DC 20020',
											instructions:
												'Appointments are available at Max Robinson Center Monday through Thursday 08:30-12:30 & 13:30-17:30; and Fridays 08:30-12:30 & 14:15-17:30.',
											access_value_ES: '2301 M. Luther King Jr., Washington DC 20020',
											instructions_ES:
												'Las citas están disponibles en Max Robinson Center de lunes a jueves de 08:30 a 12:30 y de 13:30 a 17:30; y viernes 08:30-12:30 y 14:15-17:30.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC7BE9JBZ42FCNA0TXR',
										ns: 'org-data',
										tsKey: {
											text: "Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '5e7e4bdbd54f1760921a4272',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/care-program/legal-services-immigration',
											instructions:
												"Visit the website for more information on how Whitman-Walker Health's legal team can help with immigration issues.",
											access_value_ES:
												'https://www.whitman-walker.org/care-program/legal-services-immigration',
											instructions_ES:
												'Visita el sitio web para obtener más información sobre cómo el equipo legal de Whitman-Walker Health puede ayudar con los problemas de inmigración.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC7BFCRE1YD7BEZJETJ',
										ns: 'org-data',
										tsKey: {
											text: 'Appointments are available at Whitman-Walker at LIZ Mondays & Wednesdays 09:00 –12:15 pm & 13:45 – 16:30; Tuesdays & Thursdays 09:00 – 12:15 &  13:45 – 17:30.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '6220dbf0d99d3c002ee5870b',
											},
											access_type: 'location',
											access_value: '1377 R St, NW, Suite 200 Washington, DC 20009',
											instructions:
												'Appointments are available at Whitman-Walker at LIZ Mondays & Wednesdays 09:00 –12:15 pm & 13:45 – 16:30; Tuesdays & Thursdays 09:00 – 12:15 &  13:45 – 17:30.',
											access_value_ES: '1377 R St, NW, Suite 200 Washington, DC 20009',
											instructions_ES:
												'Las citas están disponibles en Whitman-Walker en LIZ los lunes y miércoles de 09:00 a 12:15 y de 13:45 a 16:30; Martes y jueves 09:00 – 12:15 y 13:45 – 17:30.',
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
			userLists: [],
			id: 'osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG',
		},
	},
	{
		service: {
			serviceName: {
				key: 'whitman-walker-health.osvc_01GVH3VEWFZ5FHZ6S7BXQY1W55.name',
				ns: 'org-data',
				tsKey: {
					text: 'Get the COVID-19 vaccine',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEWFZ5FHZ6S7BXQY1W55.description',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC8Y941F9R753NPE53A',
										ns: 'org-data',
										tsKey: {
											text: 'Call Whitman-Walker Health to schedule a vaccine appointment.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '61fa9e3f706e5300349c36cb',
											},
											access_type: 'phone',
											access_value: '202-207-2480',
											instructions: 'Call Whitman-Walker Health to schedule a vaccine appointment.',
											access_value_ES: '202-207-2480',
											instructions_ES: 'Llama a Whitman-Walker Health para programar una cita de vacunación.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC99KGDBDDCMKCHYSAA',
										ns: 'org-data',
										tsKey: {
											text: 'You can also text Whitman-Walker Health to schedule a vaccine appointment.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '61fa9e5f706e5300349c36cd',
											},
											access_type: 'phone',
											access_value: '202-978-6123',
											instructions:
												'You can also text Whitman-Walker Health to schedule a vaccine appointment.',
											access_value_ES: '202-978-6123',
											instructions_ES:
												'También puedes enviar un mensaje de texto a Whitman-Walker Health para programar una cita para la vacuna.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNAC9R7VPJ912RR1J9XM1',
										ns: 'org-data',
										tsKey: {
											text: "See Whitman-Walker Health's website for more information.",
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '61fa9f9b706e5300349c36f6',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/blogs-and-stories/covid-19-vaccine-faq/',
											instructions: "See Whitman-Walker Health's website for more information. ",
											access_value_ES:
												'https://www.whitman-walker.org/blogs-and-stories/covid-19-vaccine-faq/',
											instructions_ES:
												'Consulta el sitio web de Whitman-Walker Health para obtener más información.',
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
			userLists: [],
			id: 'osvc_01GVH3VEWFZ5FHZ6S7BXQY1W55',
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
	{
		service: {
			serviceName: {
				key: 'whitman-walker-health.osvc_01GVH3VEWM65579T29F19QXP8E.name',
				ns: 'org-data',
				tsKey: {
					text: 'Get help with navigating health insurance options',
				},
			},
			description: {
				key: 'whitman-walker-health.osvc_01GVH3VEWM65579T29F19QXP8E.description',
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
						tsKey: 'community.seniors',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNACDV3Z1EM0WMF4P3FMD',
										ns: 'org-data',
										tsKey: {
											text: 'Visit the website for more information and a full list of services offered.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '638123a0ad300f00082447ff',
											},
											access_type: 'link',
											access_value: 'https://www.whitman-walker.org/insurance-navigation-services/',
											instructions:
												'Visit the website for more information and a full list of services offered.',
											access_value_ES: 'https://www.whitman-walker.org/insurance-navigation-services/',
											instructions_ES:
												'Visita el sitio web para obtener más información y una lista completa de los servicios ofrecidos.',
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
										key: 'whitman-walker-health.attribute.atts_01GVXZNACDWW4KH4X6H4JCJQNT',
										ns: 'org-data',
										tsKey: {
											text: 'Call the Insurance Help Line with any questions.',
										},
									},
									govDist: null,
									boolean: null,
									data: {
										json: {
											_id: {
												$oid: '638124a0ad300f0008244803',
											},
											access_type: 'phone',
											access_value: '202-745-6151',
											instructions: 'Call the Insurance Help Line with any questions.',
											access_value_ES: '202-745-6151',
											instructions_ES: 'Llama a la Línea de Ayuda de Seguros si tienes alguna pregunta.',
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
			id: 'osvc_01GVH3VEWM65579T29F19QXP8E',
		},
	},
] satisfies ServicesInfoCardProps['services']
