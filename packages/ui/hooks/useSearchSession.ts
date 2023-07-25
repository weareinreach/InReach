import { useSessionStorage } from '@mantine/hooks'
import { type z } from 'zod'

import { SearchParamsSchema } from '@weareinreach/api/schemas/routes/search'

export const useSearchSession = (initialValues?: Partial<UseSearchSessionInitialValues>) => {
	const {
		params: initialParams,
		page: initialPage,
		a: initialAttributes,
		s: initialServices,
		searchTerm: initialSearchTerm,
		sort: initialSort,
	} = initialValues ?? {}

	const [params, setParams] = useSessionStorage<z.infer<typeof SearchParamsSchema> | undefined>({
		key: 'search.params',
		defaultValue: initialParams ? SearchParamsSchema.parse(initialParams) : undefined,
	})

	const [page, setPage] = useSessionStorage({ key: 'search.page', defaultValue: initialPage ?? 1 })

	const [attributes, setAttributes] = useSessionStorage({
		key: 'search.attributes',
		defaultValue: initialAttributes ?? initialValues?.attributes,
	})

	const [services, setServices] = useSessionStorage({
		key: 'search.services',
		defaultValue: initialServices ?? initialValues?.services,
	})

	const [searchTerm, setSearchTerm] = useSessionStorage({
		key: 'search.searchTerm',
		defaultValue: initialSearchTerm,
	})

	const [sort, setSort] = useSessionStorage({
		key: 'search.sort',
		defaultValue: initialSort,
	})

	const getAll = {
		params,
		page,
		attributes,
		services,
		searchTerm,
		sort,
	}
	const getRoute = () => {
		if (params)
			return {
				params,
				page: page?.toString(),
				...(attributes ? { a: attributes } : {}),
				...(services ? { s: services } : {}),
				...(sort ? { sort } : {}),
			}
	}
	const setAll = ({
		params: newParams,
		page: newPage,
		attributes: newAttributes,
		services: newServices,
		searchTerm: newSearchTerm,
		sort: newSort,
	}: Partial<UseSearchSessionInitialValues>) => {
		if (newParams) setParams(SearchParamsSchema.parse(newParams))
		if (newPage) setPage(newPage)
		if (newAttributes) setAttributes(newAttributes)
		if (newServices) setServices(newServices)
		if (newSearchTerm) setSearchTerm(newSearchTerm)
		if (newSort) setSort(newSort)
	}

	return {
		params,
		page,
		attributes,
		services,
		searchTerm,
		sort,
		setParams,
		setPage,
		setAttributes,
		setServices,
		setSearchTerm,
		setSort,
		getRoute: getRoute(),
		getAll,
		setAll,
	}
}

interface UseSearchSessionInitialValues {
	params: z.infer<typeof SearchParamsSchema> | string[]
	page: number | string
	attributes: string[]
	a: string[]
	services: string[]
	s: string[]
	searchTerm: string
	sort: string[]
}
