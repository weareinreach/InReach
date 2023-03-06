export const crowdinOpts = {
	hash: 'e-39328dacf5f98928e8273b35wj',
	nsFileMap: {
		databaseStrings: '/database/org-data.json',
		common: '/dev/common.json',
		country: '/dev/country.json',
		footer: '/dev/footer.json',
		nav: '/dev/nav.json',
		socialMedia: '/dev/socialMedia.json',
		user: '/dev/user.json',
		'gov-dist': '/dev/gov-dist.json',
		attribute: '/dev/attribute.json',
		services: '/dev/services.json',
	},
	redisTTL: 86400,
	// redisUrl: process.env.REDIS_URL,
} as const
