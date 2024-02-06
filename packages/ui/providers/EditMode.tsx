import { useEventEmitter } from 'ahooks'
import { createContext, type Dispatch, type SetStateAction, useRef, useState } from 'react'

export const EditModeContext = createContext<EditContext | null>(null)

export const EditModeProvider = ({ children }: { children: React.ReactNode }) => {
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const events = useEventEmitter<'save'>()

	const contextValue = {
		unsaved: {
			set: setHasUnsavedChanges,
			state: hasUnsavedChanges,
		},
		saveEvent: {
			save: () => events.emit('save'),
			subscribe: events.useSubscription,
		},
	}

	return <EditModeContext.Provider value={contextValue}>{children}</EditModeContext.Provider>
}

type EditContext = {
	unsaved: {
		set: Dispatch<SetStateAction<boolean>>
		state: boolean
	}
	saveEvent: {
		save: () => void
		subscribe: ReturnType<typeof useEventEmitter<'save'>>['useSubscription']
	}
}
