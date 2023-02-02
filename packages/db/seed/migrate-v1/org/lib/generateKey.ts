import { namespaces } from '~/seed/data'

export const generateKey: GenerateKey<KeyType> = (params) => {
	const { type, keyPrefix, text } = params
	if (!text || !keyPrefix) {
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
			key = keyPrefix
			break
		case 'svc': {
			ns = namespaces.orgService
			const keyBase = `${keyPrefix}.${params.servId}`
			key = params.subtype === 'access' ? `${keyBase}.access` : `${keyBase}.desc`
			break
		}
		case 'attrSupp':
			ns = namespaces.orgService
			key = `${keyPrefix}.attribute.${params.suppId}`
			break
	}
	return { ns, key, text: text?.trim() }
}

export type KeyType = 'desc' | 'svc' | 'attrSupp'
type DescKey = {
	type: 'desc'
	keyPrefix: string | undefined
	text: string | undefined
}
type SvcKey = {
	type: 'svc'
	keyPrefix: string | undefined
	servId: string
	text: string | undefined
	subtype: 'access' | 'desc'
}
type AttrSuppKey = {
	type: 'attrSupp'
	keyPrefix: string | undefined
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
