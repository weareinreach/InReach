import { useRouter } from 'next/router'
import { useContext } from 'react'

import { EditModeContext } from '~ui/providers/EditMode'

export const useEditMode = () => {
	const router = useRouter()
	const ctx = useContext(EditModeContext)
	if (!ctx) {
		throw new Error('useEditMode must be used within a EditModeProvider')
	}
	const isEditMode = router.pathname.endsWith('/edit')

	return {
		isEditMode,
		...ctx,
	}
}
