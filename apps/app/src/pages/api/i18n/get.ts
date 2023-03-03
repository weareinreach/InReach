/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { S3 } from '@aws-sdk/client-s3'
import { ResponseList, StringTranslationsModel } from '@crowdin/crowdin-api-client'
import { TranslationMap } from '@weareinreach/i18next-keys-ondemand'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import namespaces from '~app/data/namespaces'
import { crowdin, crowdinProjId, crowdinBranch, fetchTranslation } from '~app/utils/crowdin'
import { redisGetTrans, redisUpload } from '~app/utils/redis'

const Input = z.object({
	keys: z.string().array(),
	lang: z.string(),
	ns: z.enum(namespaces),
	defaultValues: z.record(z.string()),
})
const isPlural = (result: CrowdinResponse): result is StringTranslationsModel.PluralLanguageTranslation => {
	return 'plurals' in result
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const body = Input.safeParse(req.body)
		// console.log(req.body.data)
		if (!body.success) return res.status(400).json(body.error.flatten())
		const { keys, lang, ns } = body.data
		if (lang === 'en') return res.json(body.data.defaultValues)
		switch (ns) {
			case 'attribute':
			case 'common':
			case 'country':
			case 'gov-dist':
			case 'phone-type':
			case 'services':
			case 'user': {
				const filename = `${ns}+(${lang}).json`
				return res.json({})
				// const file = await s3.getObject()
			}
			case 'org-data': {
				let results: TranslationMap = {}
				const topKeys = keys.map((k) => k.split('.')[0]).filter(Boolean)

				for await (const k of topKeys) {
					console.time(k)
					const cache = await redisGetTrans(k, ns, lang)
					if (cache) {
						console.log('cache hit')
						results = { ...results, ...cache }
					} else {
						const crowdinFetch = await fetchTranslation('database', lang, k)
						if (crowdinFetch) {
							const cacheItems = await redisUpload(lang, ns, crowdinFetch)
							console.log(cacheItems)
							results = { ...results, ...crowdinFetch }
						}
					}
					console.timeEnd(k)
				}
				return res.status(200).json(results)
			}
		}
	} catch (err) {
		console.log(err)
		return res.status(500).json(err)
	}
}

export default handler

type CrowdinResponse =
	| StringTranslationsModel.PlainLanguageTranslation
	| StringTranslationsModel.PluralLanguageTranslation
	| StringTranslationsModel.IcuLanguageTranslation
