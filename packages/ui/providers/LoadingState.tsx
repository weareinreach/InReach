import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useMemo,
	useState,
} from 'react'

const LoadingStateContext = createContext<LoadingStateContext | null>(null)
LoadingStateContext.displayName = 'LoadingStateContext'
export const useLoadingState = () => {
	const loadingContext = useContext(LoadingStateContext)

	if (!loadingContext) {
		throw new Error('useLoadingState must be used within a LoadingStateProvider')
	}

	return loadingContext
}
export const LoadingStateProvider = ({ children }: LoadingStateProviderProps) => {
	const [loading, setLoading] = useState(false)
	const contextValue = useMemo(
		() => [loading, setLoading] satisfies [boolean, Dispatch<SetStateAction<boolean>>],
		[loading, setLoading]
	)
	return <LoadingStateContext.Provider value={contextValue}>{children}</LoadingStateContext.Provider>
}
type LoadingStateContext = [loading: boolean, setLoading: Dispatch<SetStateAction<boolean>>]
interface LoadingStateProviderProps {
	children: ReactNode
}
