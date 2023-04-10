import { type ServicesInfoCardProps } from '~ui/components/sections'

// http://localhost:3000/api/panel
// organization.getById: orgn_01GVH3V408N0YS7CDYAH3F2BMH
// copy value from `services` key

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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFV4TM7H5V6FHWA7S9JK',
						tsKey: 'additional.time-walk-in',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
						tsKey: 'cost.cost-free',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9F15B2HJK144B3NZHQK',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9F13VVJCJ8W2WE86R6N',
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
										'lang-all-languages-by-interpreter': null,
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9F0SPS3EBCQ710RCNTA',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F0SPS3EBCQ710RCNTA',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9F0638MD74PJ3SCWNXC',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F0638MD74PJ3SCWNXC',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9F01W2M7FBSKSXAQ9R4',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F01W2M7FBSKSXAQ9R4',
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9F09GFRWM3JK2A43AWG',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F09GFRWM3JK2A43AWG',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCFKT3NWQ79STYVDKR.description',
							ns: 'org-data',
							tsKey: {
								text: 'Medical Care/ Appointments',
							},
						},
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
			hours: [],
			attributes: [
				{
					attribute: {
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
						tsKey: 'eligibility.time-appointment-required',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGWKWB53HWAAHQ9AAZ',
						tsKey: 'cost.cost-fees',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9F29SAQ5XNN2Q9K4ZC0',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9F29SAQ5XNN2Q9K4ZC0',
								ns: 'org-data',
								tsKey: {
									text: 'Contact for more information on fees.',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9F3HSS3N7KA1F1QB1PZ',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
						tsKey: 'eligibility.other-describe',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9F2K3KC3P4649R3Q0G7',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9F2K3KC3P4649R3Q0G7',
								ns: 'org-data',
								tsKey: {
									text: "Offered to individuals connected to Whitman-Walker Health's medical services.",
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9F3KQS8A70EV2591ZTY',
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
										'lang-all-languages-by-interpreter': null,
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9F18KAE459BH3RBS9WM',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F18KAE459BH3RBS9WM',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9F2A8ET62KSWFPDA6C9',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F2A8ET62KSWFPDA6C9',
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
								id: 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW',
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
									id: 'atts_01GW2HT9F21SZHDQ5VBKDVNNS5',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F21SZHDQ5VBKDVNNS5',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCQW5N7R8YEV06D3AZ.description',
							ns: 'org-data',
							tsKey: {
								text: 'Gender Affirming Services',
							},
						},
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
						description: {
							key: 'whitman-walker-health.oeml_01GVH3VEVD5Q45WH8V1KK13EZ8.description',
							ns: 'org-data',
							tsKey: {
								text: 'Gender Affirming Services',
							},
						},
						primary: false,
						locationOnly: false,
						serviceOnly: false,
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
						tsKey: 'cost.cost-free',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
						tsKey: 'eligibility.time-appointment-required',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGSAZXGR4JAVHEK6ZC',
						tsKey: 'eligibility.elig-age',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9F4BTH28ZQDRPH5PE16',
							country: null,
							language: null,
							text: null,
							govDist: null,
							boolean: null,
							data: {
								min: 13,
							},
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9F4V12HEJRMBBKSSRB5',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9F4FM69MC7Y8RAED87F',
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
										'lang-all-languages-by-interpreter': null,
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9F3645YXQX5G69WPR3E',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F3645YXQX5G69WPR3E',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9F3XT7ZP34G152VTPDN',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F3XT7ZP34G152VTPDN',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9F46WSJJBV9ZYCCKWTY',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F46WSJJBV9ZYCCKWTY',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCFKT3NWQ79STYVDKR.description',
							ns: 'org-data',
							tsKey: {
								text: 'Medical Care/ Appointments',
							},
						},
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
						tsKey: 'cost.cost-free',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGSAZXGR4JAVHEK6ZC',
						tsKey: 'eligibility.elig-age',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9F6H5R8TAQX1GWMDQRW',
							country: null,
							language: null,
							text: null,
							govDist: null,
							boolean: null,
							data: {
								max: 24,
								min: 13,
							},
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9F6RZENAE7HKCTJQ612',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9F7HQBPVYACYSGZMQ0R',
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
										'lang-all-languages-by-interpreter': null,
									},
									{
										'service-state-washington-dc': null,
									},
								],
								meta: {
									values: {
										'2.service-state-washington-dc': ['undefined'],
										'1.lang-all-languages-by-interpreter': ['undefined'],
									},
								},
							},
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9F5WNAVZAWXHX3NWQDM',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F5WNAVZAWXHX3NWQDM',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9F5TD2Z8WMVBQNJ9KSG',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F5TD2Z8WMVBQNJ9KSG',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9F5WT5XMR933BSV4DB6',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F5WT5XMR933BSV4DB6',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCDEFMAGG3SAJVWJFQ.description',
							ns: 'org-data',
							tsKey: {
								text: 'Max Robinson Center HIV/STI & Pregnancy Testing',
							},
						},
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
						tsKey: 'cost.cost-free',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
						tsKey: 'eligibility.time-appointment-required',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGSAZXGR4JAVHEK6ZC',
						tsKey: 'eligibility.elig-age',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9F8YBG3RW555BEJPX43',
							country: null,
							language: null,
							text: null,
							govDist: null,
							boolean: null,
							data: {
								max: 24,
								min: 13,
							},
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9F8XBZ50671RY07JEYA',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
						tsKey: 'eligibility.other-describe',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9F8VANEYDQF7J5F1GEH',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9F8VANEYDQF7J5F1GEH',
								ns: 'org-data',
								tsKey: {
									text: 'Available to LGBTQ young people ages 13-24 who have experienced or witnessed a crime (no police report required).',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9F8EJ5ANBZBJFGCM48T',
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
										'lang-all-languages-by-interpreter': null,
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
								id: 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW',
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
									id: 'atts_01GW2HT9F7E3JJCMG6YYP8QY5A',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F7E3JJCMG6YYP8QY5A',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9F7FVQRS3EQSK98K956',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F7FVQRS3EQSK98K956',
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
						description: {
							key: 'whitman-walker-health.oeml_01GVH3VEVD2HF0GFPPTHJA9AJT.description',
							ns: 'org-data',
							tsKey: {
								text: 'Youth Mental Health Services',
							},
						},
						primary: false,
						locationOnly: false,
						serviceOnly: false,
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FBBGA9C2Z7CNW80T59',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9FB41ACRT97YFGV6RMK',
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
										'lang-all-languages-by-interpreter': null,
									},
									{
										'community-russia-immigrant': 'true',
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
			],
			accessDetails: [
				{
					attributes: [
						{
							attribute: {
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9F94A2CZJA09MNFDGA1',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F94A2CZJA09MNFDGA1',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9F9DGM8BZDP5DT29AHR',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F9DGM8BZDP5DT29AHR',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9F9EEESTJ3PGNGFRRFK',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F9EEESTJ3PGNGFRRFK',
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9F9NJXJYDCW6JZH6QPE',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9F9NJXJYDCW6JZH6QPE',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FAQYSYMCBGY2372PPK',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FAQYSYMCBGY2372PPK',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9FAZTE919W36R7TJEN0',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FAZTE919W36R7TJEN0',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCE8GNAJ7NJ9FYKME5.description',
							ns: 'org-data',
							tsKey: {
								text: 'Legal Services Program',
							},
						},
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
						description: {
							key: 'whitman-walker-health.oeml_01GVH3VEVDX7QVQ4QA4C1XXVN3.description',
							ns: 'org-data',
							tsKey: {
								text: 'Legal Services Program',
							},
						},
						primary: false,
						locationOnly: false,
						serviceOnly: false,
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
						tsKey: 'eligibility.time-appointment-required',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGWKWB53HWAAHQ9AAZ',
						tsKey: 'cost.cost-fees',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9FCP3N9GE0XX4JK8TC0',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9FCP3N9GE0XX4JK8TC0',
								ns: 'org-data',
								tsKey: {
									text: 'Contact for more information on fees.',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FCJ2DFW4SW2QPV7JBZ',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
						tsKey: 'eligibility.other-describe',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9FCBTTS1SW1NVENDX6G',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9FCBTTS1SW1NVENDX6G',
								ns: 'org-data',
								tsKey: {
									text: 'Due to COVID-19, please note that at this time their dental services at Whitman-Walker at 1525 14th Street, NW and Max Robinson Center in Anacostia are not accepting new patients, with the exception of patients who are living with HIV and in need of urgent dental care.',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9FCGKS23KNM319BY46Y',
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
										'lang-all-languages-by-interpreter': null,
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9FB82602PRFFPWMABZ4',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FB82602PRFFPWMABZ4',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FC3T1FAK1H2R9AVHEN',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FC3T1FAK1H2R9AVHEN',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCFKT3NWQ79STYVDKR.description',
							ns: 'org-data',
							tsKey: {
								text: 'Medical Care/ Appointments',
							},
						},
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
						description: {
							key: 'whitman-walker-health.oeml_01GVH3VEVDZK28VPR8ETDTVX2V.description',
							ns: 'org-data',
							tsKey: {
								text: 'Schedule An Appointment',
							},
						},
						primary: true,
						locationOnly: false,
						serviceOnly: false,
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
						tsKey: 'cost.cost-free',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
						tsKey: 'eligibility.time-appointment-required',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FD8RFFX8T6FZWTSE8P',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9FDGDY99PV0J6G8RMZX',
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
										'lang-all-languages-by-interpreter': null,
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FD667CNFY4RBBJ6FAZ',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FD667CNFY4RBBJ6FAZ',
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
						tsKey: 'cost.cost-free',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FG0SFR8CEEEG8E91HG',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
						tsKey: 'eligibility.other-describe',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9FG341HCE9SC4GXF5MH',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9FG341HCE9SC4GXF5MH',
								ns: 'org-data',
								tsKey: {
									text: 'transgender immigrants',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9FGT388BAV2Z95E4CEA',
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
										'lang-all-languages-by-interpreter': null,
									},
									{
										'community-russia-immigrant': 'true',
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9FEHGTRRPZ1QKKHJQDK',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FEHGTRRPZ1QKKHJQDK',
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
								id: 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW',
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
									id: 'atts_01GW2HT9FE5ARCNCQHREG91V57',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FE5ARCNCQHREG91V57',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9FED18Z3Z73Y8T0E7T9',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FED18Z3Z73Y8T0E7T9',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9FF3NQTQ8WVYQTE8GEQ',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FF3NQTQ8WVYQTE8GEQ',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FFC3WAGRM15ENKEH44',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FFC3WAGRM15ENKEH44',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9FFVMJFP7CZ1D1P8KEY',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FFVMJFP7CZ1D1P8KEY',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCE8GNAJ7NJ9FYKME5.description',
							ns: 'org-data',
							tsKey: {
								text: 'Legal Services Program',
							},
						},
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
						description: {
							key: 'whitman-walker-health.oeml_01GVH3VEVDX7QVQ4QA4C1XXVN3.description',
							ns: 'org-data',
							tsKey: {
								text: 'Legal Services Program',
							},
						},
						primary: false,
						locationOnly: false,
						serviceOnly: false,
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
						tsKey: 'cost.cost-free',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
						tsKey: 'eligibility.time-appointment-required',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGWKWB53HWAAHQ9AAZ',
						tsKey: 'cost.cost-fees',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9FHDJG98PD82333SEV0',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9FHDJG98PD82333SEV0',
								ns: 'org-data',
								tsKey: {
									text: 'The vaccine will be free.',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FH7QPW00YKZNPK4CTY',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9FJ1SWH3ARN7W7G83X0',
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9FGCEKNHH2JX814JZNX',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FGCEKNHH2JX814JZNX',
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9FHA4WJG4WAD6V75V9W',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FHA4WJG4WAD6V75V9W',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FHVJFJBZP4EX2Q02D6',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FHVJFJBZP4EX2Q02D6',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVDSJTN1379Y17FNP28.description',
							ns: 'org-data',
							tsKey: {
								text: 'COVID-19 Vaccine Appointments',
							},
						},
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
						id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
						tsKey: 'additional.has-confidentiality-policy',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'additional-information',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
						tsKey: 'eligibility.time-appointment-required',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVGWKWB53HWAAHQ9AAZ',
						tsKey: 'cost.cost-fees',
						tsNs: 'attribute',
						icon: 'carbon:piggy-bank',
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'cost',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9FKYRTJ0QZ2G84NZ33S',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9FKYRTJ0QZ2G84NZ33S',
								ns: 'org-data',
								tsKey: {
									text: 'Contact for more information on fees.',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVH0GQK0GAJR5D952V3',
						tsKey: 'eligibility.req-proof-of-age',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVHZ599M48CMSPGDCSC',
						tsKey: 'eligibility.req-photo-id',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FK3E82QQ2H17GBS476',
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
				{
					attribute: {
						id: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
						tsKey: 'eligibility.other-describe',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							id: 'atts_01GW2HT9FK6W1R7RR2YKY7EM85',
							country: null,
							language: null,
							text: {
								key: 'whitman-walker-health.attribute.atts_01GW2HT9FK6W1R7RR2YKY7EM85',
								ns: 'org-data',
								tsKey: {
									text: 'If someone is working with them who is under the age of 18, they will require a mental health assessment as well as parental or guardian consent.',
								},
							},
							govDist: null,
							boolean: null,
							data: null,
						},
					],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
							id: 'atts_01GW2HT9FME78R743MNP9H9HCG',
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
										'lang-all-languages-by-interpreter': null,
									},
									{
										'service-city-district-of-columbia-washington': 'true',
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9FJVRYRWH7YKD5PSXJQ',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FJVRYRWH7YKD5PSXJQ',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FJVN6X0NCHDMQRNH1J',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FJVN6X0NCHDMQRNH1J',
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
								id: 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW',
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
									id: 'atts_01GW2HT9FK5WYEX857QKM3KM2F',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FK5WYEX857QKM3KM2F',
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
								id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
									id: 'atts_01GW2HT9FKR1P5XFFG4QR14FT8',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FKR1P5XFFG4QR14FT8',
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
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						phoneLangs: [],
						phoneType: null,
						description: {
							key: 'whitman-walker-health.ophn_01GVH3VEVCQW5N7R8YEV06D3AZ.description',
							ns: 'org-data',
							tsKey: {
								text: 'Gender Affirming Services',
							},
						},
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
						description: {
							key: 'whitman-walker-health.oeml_01GVH3VEVD5Q45WH8V1KK13EZ8.description',
							ns: 'org-data',
							tsKey: {
								text: 'Gender Affirming Services',
							},
						},
						primary: false,
						locationOnly: false,
						serviceOnly: false,
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
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FNB2D3N8VJ8SMB7GE9',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FM36V51QJW06D31Q6V',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FM36V51QJW06D31Q6V',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FM961XSJQGYGES7CVA',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FM961XSJQGYGES7CVA',
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
						id: 'attr_01GW2HHFVHEVX4PMNN077ASQMG',
						tsKey: 'eligibility.req-proof-of-income',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVHGMVCAY1G5BWF1PFB',
						tsKey: 'eligibility.req-proof-of-residence',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVHZ599M48CMSPGDCSC',
						tsKey: 'eligibility.req-photo-id',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'eligibility-requirements',
									icon: null,
								},
							},
						],
					},
					supplement: [],
				},
				{
					attribute: {
						id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
							id: 'atts_01GW2HT9FP9EY8JT9TP19P9P3G',
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
								id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
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
									id: 'atts_01GW2HT9FN6GJVMKPTD4EKNKRT',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FN6GJVMKPTD4EKNKRT',
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
								id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
									id: 'atts_01GW2HT9FNFHZQY1GK71C2001B',
									country: null,
									language: null,
									text: {
										key: 'whitman-walker-health.attribute.atts_01GW2HT9FNFHZQY1GK71C2001B',
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
