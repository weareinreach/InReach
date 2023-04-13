/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { Sha256 } from '@aws-crypto/sha256-js'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { Logger } from 'tslog'
import { z } from 'zod'

import { crowdinOpts } from '~app/data/crowdinOta'
import { fetchCrowdinFile, fetchCrowdinDbKey, crowdinDistTimestamp } from '~app/utils/crowdin'

const QuerySchema = z.object({
	lng: z.string(),
	ns: z.string(),
})

const log = new Logger({ name: 'i18n Loader' })

const sigV4 = new SignatureV4({
	credentials: {
		accessKeyId: process.env.CACHE_ACCESS_KEY as string,
		secretAccessKey: process.env.CACHE_SECRET as string,
	},
	region: 'us-east-1',
	service: 'lambda',
	sha256: Sha256,
})
const cacheReadUrl = new URL(process.env.CACHE_READ_URL as string)
const cacheWriteUrl = new URL(process.env.CACHE_WRITE_URL as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const query = QuerySchema.parse(req.query)
	const namespaces = query.ns.split(' ')
	const langs = query.lng.split(' ')
	const cacheWriteQueue: WriteCacheArgs[] = []
	const otaManifestTimestamp = await crowdinDistTimestamp()
	const results = new Map<string, object>()

	for (const lang of langs) {
		try {
			const nsFileMap = crowdinOpts.nsFileMap(lang)
			if (lang === 'en') continue
			const databaseFile = crowdinOpts.nsFileMap(lang).databaseStrings
			const cacheReadReq = await sigV4.sign({
				method: 'POST',
				hostname: cacheReadUrl.hostname,
				path: cacheReadUrl.pathname,
				protocol: cacheReadUrl.protocol,
				headers: {
					'Content-Type': 'application/json',
					host: cacheReadUrl.hostname,
				},
				body: JSON.stringify({ namespaces, lang, otaManifestTimestamp }),
			})
			const { data: cached } = await axios({
				...cacheReadReq,
				url: cacheReadUrl.toString(),
				data: { namespaces, lang, otaManifestTimestamp },
			})

			const langResult = new Map<string, object | string>(cached)
			await Promise.all(
				namespaces.map(async (ns) => {
					switch (true) {
						case langResult.has(ns): {
							return
						}
						case Object.hasOwn(nsFileMap, ns): {
							const file = nsFileMap[ns as keyof typeof nsFileMap] ?? ''
							const strings = await fetchCrowdinFile(file, lang)
							if (strings) cacheWriteQueue.push({ lang, ns, strings })
							langResult.set(ns, strings)
						}
						default: {
							const file = databaseFile
							const strings = await fetchCrowdinDbKey(ns, file, lang)
							if (strings) cacheWriteQueue.push({ lang, ns, strings })
							langResult.set(ns, strings)
						}
					}
				})
			)
			const cacheWriteReq = await sigV4.sign({
				method: 'POST',
				hostname: cacheWriteUrl.hostname,
				path: cacheWriteUrl.pathname,
				protocol: cacheWriteUrl.protocol,
				headers: {
					'Content-Type': 'application/json',
					host: cacheWriteUrl.hostname,
				},
				body: JSON.stringify(cacheWriteQueue),
			})

			const { data: writeRes } = await axios({
				...cacheWriteReq,
				url: cacheWriteUrl.toString(),
				data: JSON.stringify(cacheWriteQueue),
			})
			results.set(lang, Object.fromEntries(langResult))
		} catch (error) {
			log.error(error)
		}
	}
	const data = Object.fromEntries(results.entries())
	res.status(200).json(data)
}

interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string | object>
}
