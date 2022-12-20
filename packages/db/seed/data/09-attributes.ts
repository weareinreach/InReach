type AttributeItem = {
	name: string
	description?: string
	key: string
	requireLanguage?: boolean
	requireCountry?: boolean
	requireData?: boolean
	requireText?: boolean
}
type AttributeCategory = {
	name: string
	description?: string
	namespace: string
	attributes: AttributeItem[]
}
type AttributeData = AttributeCategory[]

export const attributeData: AttributeData = [
	{
		name: 'Additional Information',
		description: 'Misc',
		namespace: 'additional',
		attributes: [
			{
				key: 'has-confidentiality-policy',
				name: 'Has A Confidentiality Policy',
				description: 'If the organization has a confidentiality policy',
			},
			{
				key: 'at-capacity',
				name: 'At capacity',
				description: 'If the service is currently "at capacity" (i.e. unable to take on new clients)',
			},
			{
				key: 'geo-near-public-transit',
				name: 'Near public transportation',
			},
			{
				key: 'geo-public-transit-description',
				name: 'Public transit / specific directions',
				description: 'Written description of public transit services',
			},
			{
				key: 'time-walk-in',
				name: 'Has Walk-In Hours',
				description: 'Accepts walk-ins; Walk-in clinic hours; Legal clinic; No appointment required',
			},
		],
	},
	{
		name: 'Community',
		namespace: 'community',
		attributes: [
			{
				key: 'language-speakers',
				name: 'Opportunities that serve {{language}} speakers',
				description: 'Opportinities for speakers of a certain language',
				requireLanguage: true,
			},
			{
				key: 'asylum-seeker',
				name: 'Opportunities that serve Asylum seekers from {{country}}',
				description: 'Opportunities that serve an Asylum seeker of a specific country',
				requireCountry: true,
			},
			{
				key: 'citizens',
				name: 'Citizens of {{country}}',
				description: 'Citizens of a specified country',
				requireCountry: true,
			},
			{
				key: 'adults',
				name: '"adult" defined as 18 years or older',
				description: '"adult" defined as 18 years or older',
			},
			{
				key: 'africa-immigrant',
				name: 'Opportunities that serve those from African countries',
				description: 'Opportunities that serve those from African countries',
			},
			{
				key: 'african-american',
				name: 'Opportunities that serve the African American community',
				description: 'Opportunities that serve the African American community',
			},
			{
				key: 'api',
				name: 'Opportunities that serve the Asian and Pacific Islander community',
				description: 'Opportunities that serve the Asian and Pacific Islander community',
			},
			{
				key: 'asexual',
				name: 'Opportunities that serve the Asexual Community',
				description: 'Opportunities that serve the Asexual Community',
			},
			{
				key: 'asia-immigrant',
				name: 'Opportunities that serve those from Asian countries',
				description: 'Opportunities that serve those from Asian countries',
			},

			{
				key: 'asylee',
				name: 'Opportunities that serve Asylees (those who have been granted asylum status)',
				description: 'Opportunities that serve Asylees (those who have been granted asylum status)',
			},

			{
				key: 'bipoc',
				name: 'Opportunities that serve Black, Indigenous, and People of Color',
				description: 'Opportunities that serve Black, Indigenous, and People of Color',
			},
			{
				key: 'bisexual',
				name: 'Opportunities that serve the Bisexual Community',
				description: 'Opportunities that serve the Bisexual Community',
			},
			{
				key: 'black',
				name: 'Opportunities that serve the Black Community',
				description: 'Opportunities that serve the Black Community',
			},
			{
				key: 'conversion-therapy-survivors',
				name: 'Opportunities that serve Conversion Therapy Survivors',
				description: 'Opportunities that serve Conversion Therapy Survivors',
			},
			{
				key: 'daca-recipient-seeker',
				name: 'Opportunities that serve Dreamers (DACA recipients)',
				description: 'Opportunities that serve Dreamers (DACA recipients)',
			},
			{
				key: 'detained-immigrant',
				name: 'Opportunities that serve detained immigrants',
				description: 'Opportunities that serve detained immigrants',
			},
			{
				key: 'disabled',
				name: 'Opportunities that serve the disabled community',
				description: 'Opportunities that serve the disabled community',
			},
			{
				key: 'gay',
				name: 'Opportunities that serve the Gay Community',
				description: 'Opportunities that serve the Gay Community',
			},
			{
				key: 'gender-nonconforming',
				name: 'Opportunities that serve the Gender nonconforming community',
				description: 'Opportunities that serve the Gender nonconforming community',
			},
			{
				key: 'hiv-aids',
				name: 'Opportunities that serve the HIV+ and at-risk community',
				description: 'Opportunities that serve the HIV+ and at-risk community',
			},
			{
				key: 'homeless',
				name: 'Opportunities that serve homeless individuals',
				description: 'Opportunities that serve homeless individuals',
			},
			{
				key: 'human-trafficking-survivor',
				name: 'Opportunities that serve human trafficking survivors',
				description: 'Opportunities that serve human trafficking survivors',
			},
			{
				key: 'intersex',
				name: 'Opportunities that serve the Intersex Community',
				description: 'Opportunities that serve the Intersex Community',
			},
			{
				key: 'latin-america-immigrant',
				name: 'Opportunities that serve those from Latin America',
				description: 'Opportunities that serve those from Latin America',
			},
			{
				key: 'latinx',
				name: 'Opportunities that serve the Latinx community',
				description: 'Opportunities that serve the Latinx community',
			},
			{
				key: 'lesbian',
				name: 'Opportunities that serve the Lesbian Community',
				description: 'Opportunities that serve the Lesbian Community',
			},
			{
				key: 'lgbtq-youth',
				name: 'Opportunities that serve LGBTQ+ youth',
				description: 'Opportunities that serve LGBTQ+ youth',
			},
			{
				key: 'lgbtq-youth-caregivers',
				name: 'Opportunities that serve Caregivers of LGBTQ+ youth',
				description: 'Opportunities that serve Caregivers of LGBTQ+ youth',
			},
			{
				key: 'middle-east-immigrant',
				name: 'Opportunities that serve those from the Middle East',
				description: 'Opportunities that serve those from the Middle East',
			},
			{
				key: 'muslim',
				name: 'Opportunities that serve the Muslim community',
				description: 'Opportunities that serve the Muslim community',
			},
			{
				key: 'native-american-two-spirit',
				name: 'Opportunities that serve the Native American community',
				description: 'Opportunities that serve the Native American community',
			},
			{
				key: 'nonbinary',
				name: 'Opportunities that serve the Nonbinary community',
				description: 'Opportunities that serve the Nonbinary community',
			},
			{
				key: 'queer',
				name: 'Opportunities that serve the Queer Community',
				description: 'Opportunities that serve the Queer Community',
			},
			{
				key: 'refugee',
				name: 'Opportunities that serve Refugees',
				description: 'Opportunities that serve Refugees',
			},
			{
				key: 'residents-green-card-holders',
				name: 'Opportunities that serve Residents of countries who are green card holders',
				description: 'Opportunities that serve Residents of countries who are green card holders',
			},
			{
				key: 'seniors',
				name: '"senior" defined as 65 years or older',
				description: '"senior" defined as 65 years or older',
			},
			{
				key: 'sex-workers',
				name: 'Opportunities that serve sex workers',
				description: 'Opportunities that serve sex workers',
			},

			{
				key: 'teens',
				name: '"teen" defined as 12-18 years old',
				description: '"teen" defined as 12-18 years old',
			},
			{
				key: 'transfeminine',
				name: 'Opportunities that serve the Transfeminine Community',
				description: 'Opportunities that serve the Transfeminine Community',
			},
			{
				key: 'transgender',
				name: 'Opportunities that serve the transgender community (for non-conforming or non-binary communities, use the gender-nonconforming or nonbinary properties)',
				description:
					'Opportunities that serve the transgender community (for non-conforming or non-binary communities, use the gender-nonconforming or nonbinary properties)',
			},
			{
				key: 'transmasculine',
				name: 'Opportunities that serve the Trasmasculine Community',
				description: 'Opportunities that serve the Trasmasculine Community',
			},
			{
				key: 'trans-youth',
				name: 'Opportunities that serve Trans youth',
				description: 'Opportunities that serve Trans youth',
			},
			{
				key: 'trans-youth-caregivers',
				name: 'Opportunities that serve Caregivers of Trans youth',
				description: 'Opportunities that serve Caregivers of Trans youth',
			},
			{
				key: 'undocumented',
				name: 'Opportunities that serve undocumented immigrants',
				description: 'Opportunities that serve undocumented immigrants',
			},
			{
				key: 'unaccompanied-minors',
				name: 'Opportunities that serve unaccompanied minors',
				description: 'Opportunities that serve unaccompanied minors',
			},
		],
	},
	{
		name: 'Cost',
		namespace: 'cost',
		attributes: [
			{
				key: 'cost-free',
				name: 'Free of cost',
				description: 'Services that are free of cost',
			},
			{
				key: 'cost-fees',
				name: 'Incurs a cost',
				description:
					'Enter a # or brief written short description of fees (e.g. "costs offered on a sliding scale"',
				requireData: true,
			},
		],
	},
	{
		name: 'Eligibility Requirements',
		namespace: 'eligibility',
		attributes: [
			{
				key: 'elig-age',
				name: 'Age eligibility',
				description: 'Has age requirements (minimum/maximum)',
				requireData: true,
			},
			{
				key: 'time-appointment-required',
				name: 'Time Appointment Required',
				description: 'Enter this property for all services that require an appointment in advance',
			},
			{
				key: 'req-medical-insurance',
				name: 'REQUIRES medical insurance',
				description:
					'If the service requires medical insurance from new/potential clients in order to access"',
			},
			{
				key: 'req-photo-id',
				name: 'REQUIRES a photo ID',
				description: 'If the service requires a photo ID from new/potential clients in order to access"',
			},
			{
				key: 'req-proof-of-age',
				name: 'REQUIRES proof of age',
				description: 'If the service requires proof of age from new/potential clients in order to access"',
			},
			{
				key: 'req-proof-of-income',
				name: 'REQUIRES proof of income',
				description: 'If the service requires proof of income from new/potential clients in order to access"',
			},
			{
				key: 'req-proof-of-residence',
				name: 'REQUIRES proof of residence',
				description:
					'If the service requires proof of residence from new/potential clients in order to access"',
			},
			{
				key: 'req-referral',
				name: 'REQUIRES a referral',
				description:
					'If the service requires a referral from another service provider from new/potential clients in order to access"',
			},
		],
	},
	{
		name: 'Languages',
		namespace: 'lang',
		attributes: [
			{ key: 'all-languages-by-interpreter', name: 'All languages via interpreter' },
			{
				key: 'lang-offered',
				name: 'Specific languages offered',
				requireLanguage: true,
			},
			{ key: 'american-sign-language', name: 'American Sign Language' },
		],
	},
	{
		name: 'System',
		namespace: 'sys',
		attributes: [
			{
				name: 'Incompatible Information',
				key: 'incompatible-info',
				description: 'Data that needs to be cleaned up',
				requireData: true,
			},
		],
	},
	{
		name: 'Service Access Instructions',
		namespace: 'serviceAccess',
		attributes: [
			{ key: 'accessEmail', name: 'Access Instructions - Email', requireData: true },
			{ key: 'accessFile', name: 'Access Instructions - File', requireData: true },
			{ key: 'accessLink', name: 'Access Instructions - Link', requireData: true },
			{ key: 'accessLocation', name: 'Access Instructions - Location', requireData: true },
			{ key: 'accessPhone', name: 'Access Instructions - Phone', requireData: true },
			{ key: 'accessText', name: 'Access Instructions - Text', requireText: true },
		],
	},
]
