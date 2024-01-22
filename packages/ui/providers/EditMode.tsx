import { createContext, type Dispatch, type SetStateAction, useRef, useState } from 'react'

export const EditModeContext = createContext<EditContext | null>(null)

export const EditModeProvider = ({ children }: { children: React.ReactNode }) => {
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const editModeRef = useRef<EditModeRef>({
		handleEditSubmit: (handler: () => void) => handler(),
		canSave: false,
	})

	const contextValue = {
		unsaved: {
			set: setHasUnsavedChanges,
			state: hasUnsavedChanges,
		},
		...editModeRef.current,
	}

	return <EditModeContext.Provider value={contextValue}>{children}</EditModeContext.Provider>
}

type EditContext = {
	unsaved: {
		set: Dispatch<SetStateAction<boolean>>
		state: boolean
	}
} & EditModeRef
type EditModeRef = {
	handleEditSubmit: (handler: () => void) => void
	canSave: boolean
}
