export const crowdinOpts = {
	hash: 'e-39328dacf5f98928e8273b35wj',
	nsFileMap: (lang: string) => ({
		databaseStrings: `/content/${lang}/database/org-data.json`,
		attribute: `/content/main/apps/app/public/locales/${lang}/attribute.json`,
		common: `/content/main/apps/app/public/locales/${lang}/common.json`,
		country: `/content/main/apps/app/public/locales/${lang}/country.json`,
		'gov-dist': `/content/main/apps/app/public/locales/${lang}/gov-dist.json`,
		landingPage: `/content/main/apps/app/public/locales/${lang}/landingPage.json`,
		'phone-type': `/content/main/apps/app/public/locales/${lang}/phone-type.json`,
		services: `/content/main/apps/app/public/locales/${lang}/services.json`,
		suggestOrg: `/content/main/apps/app/public/locales/${lang}/suggestOrg.json`,
		'user-title': `/content/main/apps/app/public/locales/${lang}/user-title.json`,
		user: `/content/main/apps/app/public/locales/${lang}/user.json`,
	}),
	redisTTL: 86400,
	// redisUrl: process.env.REDIS_URL,
} as const
