import { useEventEmitter } from 'ahooks'
import { createContext, type Dispatch, type SetStateAction, useMemo, useState } from 'react'

export const EditModeContext = createContext<EditContext | null>(null)

export const EditModeProvider = ({ children }: { children: React.ReactNode }) => {
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const events = useEventEmitter<'save'>()

	const contextValue = useMemo(
		() => ({
			unsaved: {
				set: setHasUnsavedChanges,
				state: hasUnsavedChanges,
			},
			saveEvent: {
				save: () => events.emit('save'),
				subscribe: events.useSubscription,
			},
		}),
		[events, hasUnsavedChanges]
	)

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
