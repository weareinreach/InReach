import { useRouter } from 'next/router'

const proper = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1)

export const useLocalizedDays = (locale?: string) => {
	const routerLocale = useRouter().locale
	locale ??= routerLocale
	const { format: dayFormat } = new Intl.DateTimeFormat(locale, { weekday: 'short' })
	const dayMap = new Map(
		[...Array(7).keys()].map((day, i) => [i, proper(dayFormat(new Date(Date.UTC(2021, 5, day))))])
	)
	return dayMap
}
