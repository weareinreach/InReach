import { type LiteralUnion } from 'type-fest'

import { type Namespaces } from '@weareinreach/db/generated/namespaces'

type Namespace = LiteralUnion<Namespaces, string>
export const nsFormatter =
	(baseNamespaces: Namespace | Namespace[]) =>
	(additionalNamespaces?: string | string[]): Namespace[] => {
		const base = Array.isArray(baseNamespaces) ? baseNamespaces : [baseNamespaces]
		const additional = Array.isArray(additionalNamespaces) ? additionalNamespaces : [additionalNamespaces]
		const fallback = base[0] as Namespace
		// react-i18next's useTranslation passes this array in as a useMemo dependency list, so
		// its length must stay constant across renders. Substitute an already-loaded base
		// namespace instead of omitting the slot when a value (e.g. an org ID that hasn't
		// resolved yet) is falsy - a harmless no-op re-load rather than an array length change.
		return [...base, ...additional.map((ns) => ns || fallback)]
	}
