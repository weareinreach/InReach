import { createContext, type Dispatch, type SetStateAction, useRef, useState } from 'react'

export const EditModeContext = createContext<EditContext | null>(null)

export const EditModeProvider = ({ children }: { children: React.ReactNode }) => {
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const editModeRef = useRef<EditModeRef>({ handleEditSubmit: (handler: () => void) => handler() })

	const contextValue = {
		unsaved: {
			set: setHasUnsavedChanges,
			state: hasUnsavedChanges,
		},
		submitEditHandler: editModeRef.current.handleEditSubmit,
	}

	return <EditModeContext.Provider value={contextValue}>{children}</EditModeContext.Provider>
}

type EditContext = {
	unsaved: {
		set: Dispatch<SetStateAction<boolean>>
		state: boolean
	}
	submitEditHandler: (handler: () => void) => void
}
type EditModeRef = {
	handleEditSubmit: (handler: () => void) => void
}
