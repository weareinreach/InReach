import { createContext, type ReactNode, useReducer } from 'react'
import { type SetRequired } from 'type-fest'
import { z } from 'zod'

const initialState: State = {
	params: [],
	page: '1',
	a: [],
	s: [],
	extended: undefined,
	sort: [],
	searchTerm: undefined,
}

const searchStateReducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'SET_PARAMS':
			return { ...state, params: action.payload }
		case 'SET_PAGE':
			return { ...state, page: action.payload }
		case 'SET_ATTRIBUTES':
			return { ...state, a: action.payload }
		case 'SET_SERVICES':
			return { ...state, s: action.payload }
		case 'SET_SEARCHTERM':
			return { ...state, searchTerm: action.payload }
		case 'SET_EXTENDED':
			return { ...state, extended: action.payload }
		case 'SET_SORT':
			return { ...state, sort: action.payload }
		case 'SET_SEARCHSTATE':
			return { ...state, ...action.payload }
		default:
			return state
	}
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
	extended: z.coerce.string().optional(),
	sort: z.string().array().optional().default([]).or(StringToArray),
	searchTerm: z.string().optional(),
})

const createActionCreators = (dispatch: React.Dispatch<Action>): ActionCreators => ({
	setParams: (payload: string[]) => dispatch({ type: 'SET_PARAMS', payload }),
	setPage: (payload: string) => dispatch({ type: 'SET_PAGE', payload }),
	setAttributes: (payload: string[]) => dispatch({ type: 'SET_ATTRIBUTES', payload }),
	setServices: (payload: string[]) => dispatch({ type: 'SET_SERVICES', payload }),
	setSearchTerm: (payload: string) => dispatch({ type: 'SET_SEARCHTERM', payload }),
	setExtended: (payload: string) => dispatch({ type: 'SET_EXTENDED', payload: payload }),
	setSort: (payload: string[]) => dispatch({ type: 'SET_SORT', payload }),
	setSearchState: (payload: z.input<typeof SearchStateSchema>) =>
		dispatch({ type: 'SET_SEARCHSTATE', payload: SearchStateSchema.parse(payload) }),
})

export const SearchStateContext = createContext<SearchStateContext | null>(null)
SearchStateContext.displayName = 'SearchStateContext'
export const SearchStateProvider = ({ children, initState }: SearchStateProviderProps) => {
	const [state, dispatch] = useReducer(searchStateReducer, { ...initialState, ...initState })

	const getRoute = () => {
		if (state.params.length) {
			return {
				params: state.params,
				page: state.page.toString(),
				...(state.a.length ? { a: state.a } : {}),
				...(state.s.length ? { s: state.s } : {}),
				...(state.sort.length ? { sort: state.sort } : {}),
			}
		}
	}

	const searchStateActions = { ...createActionCreators(dispatch), getRoute }
	const searchState = { ...state, attributes: state.a, services: state.s, getRoute }

	return (
		<SearchStateContext.Provider value={{ searchState, searchStateActions }}>
			{children}
		</SearchStateContext.Provider>
	)
}

type GetRoute = () =>
	| {
			params: string[]
			page: string
			a?: string[]
			s?: string[]
			sort?: string[]
	  }
	| undefined

export interface SearchStateContext {
	searchState: State & { attributes: string[]; services: string[]; getRoute: GetRoute }
	searchStateActions: ActionCreators & {
		getRoute: GetRoute
	}
}

export interface SearchStateProviderProps {
	children: ReactNode
	initState?: SetRequired<Partial<State>, 'params'>
}
type State = z.infer<typeof SearchStateSchema>

type Action =
	| { type: 'SET_PARAMS'; payload: string[] }
	| { type: 'SET_PAGE'; payload: string }
	| { type: 'SET_ATTRIBUTES'; payload: string[] }
	| { type: 'SET_SERVICES'; payload: string[] }
	| { type: 'SET_SEARCHTERM'; payload: string }
	| { type: 'SET_EXTENDED'; payload: string }
	| { type: 'SET_SORT'; payload: string[] }
	| { type: 'SET_SEARCHSTATE'; payload: State }

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
