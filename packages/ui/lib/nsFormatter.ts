import compact from 'just-compact'
import { type LiteralUnion } from 'type-fest'

import { type Namespaces } from '@weareinreach/db/generated/namespaces'

type Namespace = LiteralUnion<Namespaces, string>
export const nsFormatter =
	(baseNamespaces: Namespace | Namespace[]) => (additionalNamespaces?: string | string[]) =>
		compact<Namespace>([
			...(Array.isArray(baseNamespaces) ? baseNamespaces : [baseNamespaces]),
			...(Array.isArray(additionalNamespaces) ? additionalNamespaces : [additionalNamespaces]),
		])
