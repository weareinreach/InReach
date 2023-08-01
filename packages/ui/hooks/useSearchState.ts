import { useContext } from 'react'

import { SearchStateContext } from '~ui/providers/SearchState'

export const useSearchState = () => {
	const context = useContext(SearchStateContext)
	if (!context)
		throw new Error('Unable to load context. This hook must be used inside a child of SearchStateProvider.')

	return context
}
