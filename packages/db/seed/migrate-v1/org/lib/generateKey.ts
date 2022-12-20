import { namespaces } from '~/seed/data'

export const generateKey: GenerateKey<KeyType> = (params) => {
	const { type, orgSlug, text } = params
	if (!text || !orgSlug) {
		return {
			ns: undefined,
			key: undefined,
			text: undefined,
		}
	}
	let ns: string | undefined
	let key: string | undefined
	switch (type) {
		case 'desc':
			ns = namespaces.orgDescription
			key = orgSlug
			break
		case 'svc':
			ns = namespaces.orgService
			const keyBase = `${orgSlug}.${params.servId}`
			key = params.subtype === 'access' ? `${keyBase}.access` : `${keyBase}.desc`
			break
		case 'attrSupp':
			ns = namespaces.orgService
			key = `${orgSlug}.attribute.${params.suppId}`
			break
	}
	return { ns, key, text: text?.trim() }
}

export type KeyType = 'desc' | 'svc' | 'attrSupp'
type DescKey = {
	type: 'desc'
	orgSlug: string | undefined
	text: string | undefined
}
type SvcKey = {
	type: 'svc'
	orgSlug: string | undefined
	servId: string
	text: string | undefined
	subtype: 'access' | 'desc'
}
type AttrSuppKey = {
	type: 'attrSupp'
	orgSlug: string | undefined
	text: string | undefined
	suppId: string
}
export type GenerateKey<T> = (
	params: T extends 'desc' ? DescKey : T extends 'svc' ? SvcKey : AttrSuppKey
) => {
	key: string | undefined
	ns: string | undefined
	text: string | undefined
}
