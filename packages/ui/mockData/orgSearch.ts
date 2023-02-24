import { ApiInput, ApiOutput } from '@weareinreach/api'

type SearchInput = ApiInput['organization']['searchName']

export const mockSearch = (input: SearchInput): ApiOutput['organization']['searchName'] => {
	const searchRegex = new RegExp(`.*${input.search}.*`, 'i')
	const results = mockData.filter(({ name }) => searchRegex.test(name))
	return results
}

export const mockData = [
	{
		id: 'orgn_01GSKV7YTJ3R4PM8SSHBZ72HX1',
		name: 'Lyon-Martin Health Services',
		slug: 'lyon-martin-health-services',
	},
	{
		id: 'orgn_01GSKV7YV30W3B6EWEF4SJSX9S',
		name: 'Larkin Street Youth Services',
		slug: 'larkin-street-youth-services',
	},
	{
		id: 'orgn_01GSKV7YVNTF1REYZGTAPA9HP8',
		name: 'Mission Neighborhood Health Center',
		slug: 'mission-neighborhood-health-center',
	},
	{
		id: 'orgn_01GSKV7YW7XVRN9VZF9EPWWQVJ',
		name: 'North East Medical Services',
		slug: 'north-east-medical-services',
	},
	{
		id: 'orgn_01GSKV7YWS9CEYHZF99HEXMT48',
		name: 'San Francisco Community Health Center',
		slug: 'san-francisco-community-health-center',
	},
	{
		id: 'orgn_01GSKV7YXBSTXX9F9627HHRSMN',
		name: 'San Francisco City Clinic',
		slug: 'san-francisco-city-clinic',
	},
	{
		id: 'orgn_01GSKV7YXX9PW72HTYAD5DAPW4',
		name: 'St. James Infirmary (SJI)',
		slug: 'st-james-infirmary-sji',
	},
	{
		id: 'orgn_01GSKV7YYF8FDW9PAEQM606T5J',
		name: 'Upwardly Global',
		slug: 'upwardly-global',
	},
	{
		id: 'orgn_01GSKV7YZ12KK64KBGYJTNDY7Q',
		name: 'Episcopal Community Services',
		slug: 'episcopal-community-services',
	},
	{
		id: 'orgn_01GSKV7YZK90DKC1JCJGTJFJQS',
		name: 'Transgender Law Center (TLC)',
		slug: 'transgender-law-center-tlc',
	},
	{
		id: 'orgn_01GSKV7Z0425JENMBG75JSD22P',
		name: 'San Francisco City Impact',
		slug: 'san-francisco-city-impact',
	},
	{
		id: 'orgn_01GSKV7Z18SGSYMEPJS59TNYGY',
		name: 'The Trevor Project',
		slug: 'the-trevor-project',
	},
	{
		id: 'orgn_01GSKV7Z1VFW1VB6RB04P7MQ56',
		name: 'Billy DeFrank LGBTQ+ Community Center',
		slug: 'billy-defrank-lgbtq-community-center',
	},
	{
		id: 'orgn_01GSKV7Z2ZWQM265B04N0KP9JW',
		name: 'United We Dream',
		slug: 'united-we-dream',
	},
	{
		id: 'orgn_01GSKV7Z3HE7SSMGDF7ZF949RB',
		name: 'Los Angeles Regional Food Bank',
		slug: 'los-angeles-regional-food-bank',
	},
	{
		id: 'orgn_01GSKV7Z40VJ549D2TX63K0D4R',
		name: 'Los Angeles LGBT Center',
		slug: 'los-angeles-lgbt-center',
	},
	{
		id: 'orgn_01GSKV7Z4KN9HDW04FYQRF30Q4',
		name: "St. John's Well Child and Family Center",
		slug: 'st-johns-well-child-and-family-center',
	},
	{
		id: 'orgn_01GSKV7Z545Y5NZCW5G2XJRR00',
		name: 'Pro Bono Project',
		slug: 'pro-bono-project',
	},
	{
		id: 'orgn_01GSKV7Z5PFVY0KERFKHYMZDP6',
		name: 'LGBTQ Center Long Beach',
		slug: 'lgbtq-center-long-beach',
	},
	{
		id: 'orgn_01GSKV7Z6SJBT1TFD5QEZ7868Y',
		name: 'Eastmont Community Center',
		slug: 'eastmont-community-center',
	},
	{
		id: 'orgn_01GSKV7Z7AJKHE0B2G7B5HYW90',
		name: 'Covenant Presbyterian Church',
		slug: 'covenant-presbyterian-church',
	},
	{
		id: 'orgn_01GSKV7Z7X422NREA7DXJ8G6WG',
		name: 'Emeryville Citizens Assistance Program',
		slug: 'emeryville-citizens-assistance-program',
	},
	{
		id: 'orgn_01GSKV7Z8FX1ZYM86191S1CCD9',
		name: 'Northwest Immigrant Rights Project (NWIRP)',
		slug: 'northwest-immigrant-rights-project-nwirp',
	},
	{
		id: 'orgn_01GSKV7Z9JDXB27TBFRDV5AGMZ',
		name: 'Entre Hermanos',
		slug: 'entre-hermanos',
	},
	{
		id: 'orgn_01GSKV7ZA5CXFNH7E1A828J4PA',
		name: 'Law Office of Andre Olivie, PLLC',
		slug: 'law-office-of-andre-olivie-pllc',
	},
	{
		id: 'orgn_01GSKV7ZAQD87Q8D1CF5ET6XHG',
		name: 'Jewish Vocational Service SoCal (JVS SoCal)',
		slug: 'jewish-vocational-service-socal-jvs-socal',
	},
	{
		id: 'orgn_01GSKV7ZB9K1SVYNS48YAA26QP',
		name: 'PARS Equality Center',
		slug: 'pars-equality-center',
	},
	{
		id: 'orgn_01GSKV7ZBVGFXCGM44HZDZBE6H',
		name: 'Haitian Women for Haitian Refugees',
		slug: 'haitian-women-for-haitian-refugees',
	},
	{
		id: 'orgn_01GSKV7ZCBCNXV6RM0CJNK8S3R',
		name: 'The Karsh Center',
		slug: 'the-karsh-center',
	},
	{
		id: 'orgn_01GSKV7ZCX8ABDKDQCJ0C7FYK2',
		name: 'Catholic Charities of Los Angeles, Inc.',
		slug: 'catholic-charities-of-los-angeles-inc',
	},
	{
		id: 'orgn_01GSKV7ZDE2C896P8H853D9C7Z',
		name: 'Friends Community Center',
		slug: 'friends-community-center',
	},
	{
		id: 'orgn_01GSKV7ZEHMQZW5VBK906C61DM',
		name: 'The Northwest Network of Survivors',
		slug: 'the-northwest-network-of-survivors',
	},
	{
		id: 'orgn_01GSKV7ZFNDEJ0PH6YRWTA2QF7',
		name: 'Neighborcare Health',
		slug: 'neighborcare-health',
	},
	{
		id: 'orgn_01GSKV7ZG74M6CMTK1B72X23KS',
		name: 'ROOTS',
		slug: 'roots',
	},
	{
		id: 'orgn_01GSKV7ZGRFA5HCK6DG4J2Q9JD',
		name: 'Jewish Family Service of Seattle',
		slug: 'jewish-family-service-of-seattle',
	},
	{
		id: 'orgn_01GSKV7ZHAXTMPN5H4V1YGB02R',
		name: 'Asian Counseling and Referral Service (ACRS)',
		slug: 'asian-counseling-and-referral-service-acrs',
	},
	{
		id: 'orgn_01GSKV7ZHVFG0XDYY5X2MQMNXR',
		name: 'Thai Community Development Center',
		slug: 'thai-community-development-center',
	},
	{
		id: 'orgn_01GSKV7ZJDJ75T1DSWC8832EEY',
		name: "Alameda County Sheriff's Office - Youth and Family Services Bureau (YFSB)",
		slug: 'alameda-county-sheriffs-office-youth-and-family-services-bureau-yfsb',
	},
	{
		id: 'orgn_01GSKV7ZJYDGBKM6VGYMJ0QM06',
		name: 'Consejo Counseling & Referral Service',
		slug: 'consejo-counseling-and-referral-service',
	},
	{
		id: 'orgn_01GSKV7ZKG091YZ38BW1JV10F2',
		name: 'Three Dollar Bill Cinema',
		slug: 'three-dollar-bill-cinema',
	},
	{
		id: 'orgn_01GSKV7ZM1GCYTB888VCPJZTJ9',
		name: 'Rainbow City Performing Arts (RCPA)',
		slug: 'rainbow-city-performing-arts-rcpa',
	},
	{
		id: 'orgn_01GSKV7ZN508X33W2571FXX85K',
		name: 'OutVentures',
		slug: 'outventures',
	},
	{
		id: 'orgn_01GSKV7ZPA3CK1KB29XFHQ273N',
		name: 'Lutheran Community Services Northwest - Refugees Northwest Program',
		slug: 'lutheran-community-services-northwest-refugees-northwest-program',
	},
	{
		id: 'orgn_01GSKV7ZPW4NQ9T3ANJJSMBBG7',
		name: 'The Jewish Federation of Greater Seattle',
		slug: 'the-jewish-federation-of-greater-seattle',
	},
	{
		id: 'orgn_01GSKV7ZR7Y7EJ40JMZ0T6ZHJR',
		name: 'Philadelphia Human Rights Clinic',
		slug: 'philadelphia-human-rights-clinic',
	},
	{
		id: 'orgn_01GSKV7ZRZ48X16MCV729SED80',
		name: 'William Way LGBT Community Center',
		slug: 'william-way-lgbt-community-center',
	},
	{
		id: 'orgn_01GSKV7ZSQPWJ7CMM074BWDCCW',
		name: 'Nemours Pediatrics',
		slug: 'nemours-pediatrics',
	},
	{
		id: 'orgn_01GSKV7ZT9GGMHY4YVMNFRCN3Q',
		name: 'Reading Hospital Women’s Health Center',
		slug: 'reading-hospital-womens-health-center',
	},
	{
		id: 'orgn_01GSKV7ZTTMQ4A4T1Z6A2H96DG',
		name: 'Equal Access Legal Services',
		slug: 'equal-access-legal-services',
	},
	{
		id: 'orgn_01GSKV7ZVXXXGP2069FX6M7A68',
		name: 'Philadelphia Voices of Pride',
		slug: 'philadelphia-voices-of-pride',
	},
	{
		id: 'orgn_01GSKV7ZX10FX9J6VAYVA9KDQE',
		name: 'Peer Seattle',
		slug: 'peer-seattle',
	},
	{
		id: 'orgn_01GSKV7ZXJEPEVWNN5M0EKRXCC',
		name: "Children's Hospital of Philadelphia - Refugee Health Program",
		slug: 'childrens-hospital-of-philadelphia-refugee-health-program',
	},
	{
		id: 'orgn_01GSKV7ZY4XZEYANVX1C7E8AYF',
		name: 'Seattle Frontrunners',
		slug: 'seattle-frontrunners',
	},
	{
		id: 'orgn_01GSKV7ZYP2GDSH8PNJY3TVTYK',
		name: 'Whitman-Walker Health',
		slug: 'whitman-walker-health',
	},
	{
		id: 'orgn_01GSKV7ZZ7GMGR4HA686J09K2F',
		name: 'The DC Center for the LGBT Community',
		slug: 'the-dc-center-for-the-lgbt-community',
	},
	{
		id: 'orgn_01GSKV7ZZS5T2KXTK1YD385GGA',
		name: 'The Attic Youth Center',
		slug: 'the-attic-youth-center',
	},
	{
		id: 'orgn_01GSKV800AGJTHZS6Q3S210SVR',
		name: 'COMHAR',
		slug: 'comhar',
	},
	{
		id: 'orgn_01GSKV800WEBJP0026WFDC60ZP',
		name: 'Community Behavioral Health',
		slug: 'community-behavioral-health',
	},
	{
		id: 'orgn_01GSKV801EWZNDJDZHXNJYX0TJ',
		name: 'Congreso',
		slug: 'congreso',
	},
	{
		id: 'orgn_01GSKV80202MD7PTD0TF764GQA',
		name: 'AIDS Activities Coordinating Office',
		slug: 'aids-activities-coordinating-office',
	},
	{
		id: 'orgn_01GSKV804WKY61R21581QM1S08',
		name: 'Einstein Health - Community Practice Center',
		slug: 'einstein-health-community-practice-center',
	},
	{
		id: 'orgn_01GSKV805EPXBQVVV0FAPCQSHS',
		name: 'Public Health Management Corporation - Health Connection',
		slug: 'public-health-management-corporation-health-connection',
	},
	{
		id: 'orgn_01GSKV80601Q24151QRZCQ4HVN',
		name: 'Public Health Management Corporation - Rising Sun',
		slug: 'public-health-management-corporation-rising-sun',
	},
	{
		id: 'orgn_01GSKV806HHFJZRS3YZQQTMSY3',
		name: 'Lambert House',
		slug: 'lambert-house',
	},
	{
		id: 'orgn_01GSKV8072RG8Q64KT6EX7WM00',
		name: 'The Mazzoni Center',
		slug: 'the-mazzoni-center',
	},
	{
		id: 'orgn_01GSKV807MXP55HHZ9DR570S2W',
		name: 'Nationalities Services Center',
		slug: 'nationalities-services-center',
	},
	{
		id: 'orgn_01GSKV8086PF12B1G5S5KMHMHZ',
		name: 'The COLOURS Organization',
		slug: 'the-colours-organization',
	},
	{
		id: 'orgn_01GSKV808QQ0KSMMRT1900SB0J',
		name: 'Women Organized Against Rape (WOAR)',
		slug: 'women-organized-against-rape-woar',
	},
	{
		id: 'orgn_01GSKV80AYBHFPQR5HYQHN1Y6V',
		name: 'AccessMatters',
		slug: 'accessmatters',
	},
	{
		id: 'orgn_01GSKV80BF1DKN38AWM42N7CH2',
		name: 'AIDS Law Project of Pennsylvania',
		slug: 'aids-law-project-of-pennsylvania',
	},
	{
		id: 'orgn_01GSKV80CHXF7S80WWMFHVHH05',
		name: 'African Cultural Alliance of North America, Inc.',
		slug: 'african-cultural-alliance-of-north-america-inc',
	},
	{
		id: 'orgn_01GSKV80D4G6VH7P46MZVE34QG',
		name: 'Catholic Social Services of Philadelphia - Immigration Legal Services',
		slug: 'catholic-social-services-of-philadelphia-immigration-legal-services',
	},
	{
		id: 'orgn_01GSKV80E6VAN5Y1VQYQZK7FRK',
		name: 'El Centro de la Raza',
		slug: 'el-centro-de-la-raza',
	},
	{
		id: 'orgn_01GSKV80EQB9J7JNV4AYESDR12',
		name: 'Human Rights First',
		slug: 'human-rights-first',
	},
	{
		id: 'orgn_01GSKV80FB7Y8669784XFN5FQN',
		name: 'The George Washington University Immigration Clinic',
		slug: 'the-george-washington-university-immigration-clinic',
	},
	{
		id: 'orgn_01GSKV80HG3HN3XKNW81BWFPH6',
		name: "Capital Area Immigrants' Rights (CAIR) Coalition",
		slug: 'capital-area-immigrants-rights-cair-coalition',
	},
	{
		id: 'orgn_01GSKV80J2KNWNP0TY5EM36Z2S',
		name: 'National Center for Lesbian Rights (NCLR)',
		slug: 'national-center-for-lesbian-rights-nclr',
	},
	{
		id: 'orgn_01GSKV80K5Y6WT4JGDRZ605ZF6',
		name: 'Penn Medicine Program for LGBT Health',
		slug: 'penn-medicine-program-for-lgbt-health',
	},
	{
		id: 'orgn_01GSKV80MSNSJXHV1SX209VSF7',
		name: 'The LGBT Asylum Project',
		slug: 'the-lgbt-asylum-project',
	},
	{
		id: 'orgn_01GSKV80PQTS0GCFACR35YG4J6',
		name: 'The Lesbian, Gay, Bisexual & Transgender Community Center',
		slug: 'the-lesbian-gay-bisexual-and-transgender-community-center',
	},
	{
		id: 'orgn_01GSKV80QXZS5281HXQ6SMJ2NP',
		name: 'St. James Immigrant Assistance',
		slug: 'st-james-immigrant-assistance',
	},
	{
		id: 'orgn_01GSKV80REK1Z8XGH3NS8MHA4J',
		name: 'Rainbow Center',
		slug: 'rainbow-center',
	},
	{
		id: 'orgn_01GSKV80RZJV32Z3VEPEWGB8NK',
		name: 'New York Legal Assistance Group (NYLAG)',
		slug: 'new-york-legal-assistance-group-nylag',
	},
	{
		id: 'orgn_01GSKV80SHTVWB7EK10WG3FSDP',
		name: 'African Hope Committee',
		slug: 'african-hope-committee',
	},
	{
		id: 'orgn_01GSKV80T3NTH3P2NEQF54XS0P',
		name: 'City Bar Justice Center (CBJC)',
		slug: 'city-bar-justice-center-cbjc',
	},
	{
		id: 'orgn_01GSKV80TMTCJDBVKNGA4CJHDT',
		name: 'Housing Works',
		slug: 'housing-works',
	},
	{
		id: 'orgn_01GSKV80V6ZX0E5WWQXQX0RC23',
		name: 'Immigration Equality',
		slug: 'immigration-equality',
	},
	{
		id: 'orgn_01GSKV81CKCYRQ4B6MNSSYCFK0',
		name: 'RAICES - San Antonio North',
		slug: 'raices-san-antonio-north',
	},
	{
		id: 'orgn_01GSKV80WC6JV47EF4T8NA1H8H',
		name: 'Gender Justice League (GJL)',
		slug: 'gender-justice-league-gjl',
	},
	{
		id: 'orgn_01GSKV80Y1BQKC2FDKZ14R0BTJ',
		name: 'People of Color Against AIDS Network (POCAAN)',
		slug: 'people-of-color-against-aids-network-pocaan',
	},
	{
		id: 'orgn_01GSKV80Z48VYKHPRWHP01ZQC7',
		name: 'HealthRIGHT 360',
		slug: 'healthright-360',
	},
	{
		id: 'orgn_01GSKV80ZPWHF9PM7C7G5E05VQ',
		name: 'Queer Detainee Empowerment Project (QDEP)',
		slug: 'queer-detainee-empowerment-project-qdep',
	},
	{
		id: 'orgn_01GSKV8109S9RKKZQJY72GZRVF',
		name: 'Community Forward San Francisco',
		slug: 'community-forward-san-francisco',
	},
	{
		id: 'orgn_01GSKV810T4GPF2RF968V4Z7ZP',
		name: 'Homeless Outreach Program Integrated Care System (HOPICS)',
		slug: 'homeless-outreach-program-integrated-care-system-hopics',
	},
	{
		id: 'orgn_01GSKV811BMKXHS88PFD0VK2RJ',
		name: 'Safe Horizon',
		slug: 'safe-horizon',
	},
	{
		id: 'orgn_01GSKV8120EYRWBHAW915M0QE5',
		name: 'RUSA LGBT',
		slug: 'rusa-lgbt',
	},
	{
		id: 'orgn_01GSKV812HYNB02ZGABFXAGNHP',
		name: 'RIF Asylum Support',
		slug: 'rif-asylum-support',
	},
	{
		id: 'orgn_01GSKV8134SBEQ5E34JCMKDAFS',
		name: 'Jewish Family Services of Western New York',
		slug: 'jewish-family-services-of-western-new-york',
	},
	{
		id: 'orgn_01GSKV813SGKXCKZWWX484G5WR',
		name: "HealthRight International's Human Rights Clinic (HRC)",
		slug: 'healthright-internationals-human-rights-clinic-hrc',
	},
	{
		id: 'orgn_01GSKV814BV7YGZ46HCTJPAYDA',
		name: 'BronxWorks',
		slug: 'bronxworks',
	},
]
