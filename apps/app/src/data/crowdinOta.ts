export const crowdinOpts = {
	hash: 'e-39328dacf5f98928e8273b35wj',
	nsFileMap: (lang: string) => ({
		databaseStrings: `/content/${lang}/database/org-data.json`,
		common: `/content/main/apps/app/public/locales/${lang}/common.json`,
		country: `/content/main/apps/app/public/locales/${lang}/country.json`,
		footer: `/content/main/apps/app/public/locales/${lang}/footer.json`,
		nav: `/content/main/apps/app/public/locales/${lang}/nav.json`,
		socialMedia: `/content/main/apps/app/public/locales/${lang}/socialMedia.json`,
		user: `/content/main/apps/app/public/locales/${lang}/user.json`,
		attribute: `/content/main/apps/app/public/locales/${lang}/attribute.json`,
		services: `/content/main/apps/app/public/locales/${lang}/services.json`,
		'gov-dist': `/content/main/apps/app/public/locales/${lang}/gov-dist.json`,
	}),
	redisTTL: 86400,
	// redisUrl: process.env.REDIS_URL,
} as const
