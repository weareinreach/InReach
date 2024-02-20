import { useRouter } from 'next/router'
import { useContext } from 'react'

import { EditModeContext } from '~ui/providers/EditMode'

export const useEditMode = () => {
	const router = useRouter()
	const ctx = useContext(EditModeContext)
	if (!ctx) {
		throw new Error('useEditMode must be used within a EditModeProvider')
	}
	const editPaths: (typeof router.pathname)[] = [
		'/org/[slug]/edit',
		'/org/[slug]/[orgLocationId]/edit',
		'/org/[slug]/[orgLocationId]/edit/[orgServiceId]',
	]

	const isEditMode = editPaths.includes(router.pathname)

	return {
		isEditMode,
		...ctx,
	}
}
