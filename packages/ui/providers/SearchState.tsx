import { createContext, type ReactNode, useContext, useDebugValue, useReducer } from 'react'
import { z } from 'zod'

interface State {
	searchState: {
		params: string[]
		page: string
		attributes: string[]
		services: string[]
	}
	searchTerm?: string
}

type Action =
	| { type: 'SET_PARAMS'; payload: string[] }
	| { type: 'SET_PAGE'; payload: string }
	| { type: 'SET_ATTRIBUTES'; payload: string[] }
	| { type: 'SET_SERVICES'; payload: string[] }
	| { type: 'SET_SEARCHTERM'; payload: string }
	| { type: 'SET_SEARCHSTATE'; payload: State['searchState'] }

const initialState: State = {
	searchState: {
		params: [],
		page: '',
		attributes: [],
		services: [],
	},
}

const reducer = (state: State, action: Action): State => {
	console.log(state, action)
	switch (action.type) {
		case 'SET_PARAMS':
			return { ...state, searchState: { ...state.searchState, params: action.payload } }
		case 'SET_PAGE':
			return { ...state, searchState: { ...state.searchState, page: action.payload } }
		case 'SET_ATTRIBUTES':
			return { ...state, searchState: { ...state.searchState, attributes: action.payload } }
		case 'SET_SERVICES':
			return { ...state, searchState: { ...state.searchState, services: action.payload } }
		case 'SET_SEARCHTERM':
			return { ...state, searchTerm: action.payload }
		case 'SET_SEARCHSTATE':
			return { ...state, searchState: action.payload }
		default:
			return state
	}
}

type DispatchAction<T> = (payload: T) => void

type ActionCreators = {
	setParams: DispatchAction<string[]>
	setPage: DispatchAction<string>
	setAttributes: DispatchAction<string[]>
	setServices: DispatchAction<string[]>
	setSearchTerm: DispatchAction<string>
	setSearchState: DispatchAction<z.input<typeof SearchStateSchema>>
}
const SearchStateSchema = z.object({
	params: z.string().array(),
	page: z.string().optional().default('1'),
	attributes: z.string().array().optional().default([]),
	services: z.string().array().optional().default([]),
})

const StateSchema = z.object({
	searchState: SearchStateSchema,
	searchTerm: z.string().optional(),
})

const createActionCreators = (dispatch: React.Dispatch<Action>): ActionCreators => ({
	setParams: (payload: string[]) => dispatch({ type: 'SET_PARAMS', payload }),
	setPage: (payload: string) => dispatch({ type: 'SET_PAGE', payload }),
	setAttributes: (payload: string[]) => dispatch({ type: 'SET_ATTRIBUTES', payload }),
	setServices: (payload: string[]) => dispatch({ type: 'SET_SERVICES', payload }),
	setSearchTerm: (payload: string) => dispatch({ type: 'SET_SEARCHTERM', payload }),
	setSearchState: (payload: z.input<typeof SearchStateSchema>) =>
		dispatch({ type: 'SET_SEARCHSTATE', payload: SearchStateSchema.parse(payload) }),
})

const SearchStateContext = createContext<SearchStateContext | null>(null)
export const SearchStateProvider = ({ children, initState }: SearchStateProviderProps) => {
	const [state, dispatch] = useReducer(reducer, initState ?? initialState)

	const routeActions = createActionCreators(dispatch)

	return (
		<SearchStateContext.Provider value={{ searchParams: state, routeActions }}>
			{children}
		</SearchStateContext.Provider>
	)
}

export const useSearchState = () => {
	const context = useContext(SearchStateContext)
	if (!context) throw new Error('Unable to load context')
	const { searchParams, routeActions } = context
	useDebugValue(searchParams)

	return { searchParams, routeActions }
}

export interface SearchStateContext {
	searchParams: State
	routeActions: ActionCreators
}

interface SearchStateProviderProps {
	children: ReactNode
	initState?: State
}
