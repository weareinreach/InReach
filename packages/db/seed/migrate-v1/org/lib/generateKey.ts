import { slug } from '~db/lib/slugGen'
import { namespaces } from '~db/seed/data'

export const generateKey: GenerateKey<KeyType> = (params) => {
	const { type, keyPrefix, text } = params
	if (!text || (!keyPrefix && type !== 'phoneType')) {
		return {
			ns: undefined,
			key: undefined,
			text: undefined,
		}
	}
	let ns: string | undefined
	let key: string | undefined
	switch (type) {
		case 'desc': {
			ns = namespaces.orgData
			key = `${keyPrefix}.description`
			break
		}
		case 'svc': {
			ns = namespaces.orgData
			const keyBase = `${keyPrefix}.${params.servId}`
			key =
				params.subtype === 'access'
					? `${keyBase}.access`
					: params.subtype === 'name'
					? `${keyBase}.name`
					: `${keyBase}.description`
			break
		}
		case 'attrSupp': {
			ns = namespaces.orgData
			key = `${keyPrefix}.attribute.${params.suppId}`
			break
		}
		case 'phoneType': {
			ns = namespaces.phoneType
			key = slug(text)
		}
	}
	return { ns, key, text: text?.trim() }
}

export type KeyType = 'desc' | 'svc' | 'attrSupp' | 'phoneType'
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
	subtype: 'access' | 'desc' | 'name'
}
type AttrSuppKey = {
	type: 'attrSupp'
	keyPrefix: string | undefined
	text: string | undefined
	suppId: string
}
type PhoneTypeKey = {
	type: 'phoneType'
	keyPrefix?: string | undefined
	text: string | undefined
}
export type GenerateKey<T> = (
	params: T extends 'desc'
		? DescKey
		: T extends 'phoneType'
		? PhoneTypeKey
		: T extends 'svc'
		? SvcKey
		: AttrSuppKey
) => {
	key: string | undefined
	ns: string | undefined
	text: string | undefined
}