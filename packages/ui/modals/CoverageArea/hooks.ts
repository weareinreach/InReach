import { useState } from 'react'

export const useServiceAreaSelections = () => {
	const [selected, setSelected] = useState<SelectionState>({ country: null, govDist: null, subDist: null })
	const setVal = {
		country: (value: string) => setSelected({ country: value, govDist: null, subDist: null }),
		govDist: (value: string) => setSelected((prev) => ({ ...prev, govDist: value, subDist: null })),
		subDist: (value: string) => setSelected((prev) => ({ ...prev, subDist: value })),
		blank: () => setSelected({ country: null, govDist: null, subDist: null }),
	}

	return [selected, setVal] as [typeof selected, typeof setVal]
}
type SelectionState = { country: string | null; govDist: string | null; subDist: string | null }
