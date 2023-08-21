import { useContext } from 'react'

import { EditModeContext } from '~ui/providers/EditMode'

export const useEditMode = () => {
	const ctx = useContext(EditModeContext)
	if (!ctx) {
		throw new Error('useEditMode must be used within a EditModeProvider')
	}
	return ctx
}
