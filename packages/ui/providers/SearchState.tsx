import { createContext, type ReactNode, useContext, useDebugValue, useReducer } from 'react'
import { z } from 'zod'

interface State {
	searchState: {
		params: string[]
		page: string
		a?: string[]
		s?: string[]
		extended?: string | boolean
		sort?: string[]
	}
	searchTerm?: string
}

type Action =
	| { type: 'SET_PARAMS'; payload: string[] }
	| { type: 'SET_PAGE'; payload: string }
	| { type: 'SET_ATTRIBUTES'; payload: string[] }
	| { type: 'SET_SERVICES'; payload: string[] }
	| { type: 'SET_SEARCHTERM'; payload: string }
	| { type: 'SET_EXTENDED'; payload: string }
	| { type: 'SET_SORT'; payload: string[] }
	| { type: 'SET_SEARCHSTATE'; payload: State['searchState'] }

const initialState: State = {
	searchState: {
		params: [],
		page: '',
		a: [],
		s: [],
		extended: '',
		sort: [],
	},
}

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'SET_PARAMS':
			return { ...state, searchState: { ...state.searchState, params: action.payload } }
		case 'SET_PAGE':
			return { ...state, searchState: { ...state.searchState, page: action.payload } }
		case 'SET_ATTRIBUTES':
			return { ...state, searchState: { ...state.searchState, a: action.payload } }
		case 'SET_SERVICES':
			return { ...state, searchState: { ...state.searchState, s: action.payload } }
		case 'SET_SEARCHTERM':
			return { ...state, searchTerm: action.payload }
		case 'SET_EXTENDED':
			return { ...state, searchState: { ...state.searchState, extended: action.payload } }
		case 'SET_SORT':
			return { ...state, searchState: { ...state.searchState, sort: action.payload } }
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
	setExtended: DispatchAction<string>
	setSort: DispatchAction<string[]>
	setSearchState: DispatchAction<z.input<typeof SearchStateSchema>>
}

const StringToArray = z
	.string()
	.optional()
	.transform((val) => (val ? [val] : []))
	.pipe(z.string().array())

const SearchStateSchema = z.object({
	params: z.string().array(),
	page: z.string().optional().default('1'),
	a: z.string().array().optional().default([]).or(StringToArray),
	s: z.string().array().optional().default([]).or(StringToArray),
	extended: z.string().or(z.boolean()).optional(),
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
	setExtended: (payload: string | boolean) => dispatch({ type: 'SET_EXTENDED', payload: payload.toString() }),
	setSort: (payload: string[]) => dispatch({ type: 'SET_SORT', payload }),
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
