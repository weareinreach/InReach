import { Checkbox, Slider, Stack, Title } from '@mantine/core'
import { useUncontrolled } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { z } from 'zod'

const ParamSchema = z.tuple([
	z.literal('dist'),
	z.coerce.number().gte(-180).lte(180).describe('longitude'),
	z.coerce.number().gte(-90).lte(90).describe('latitude'),
	z.coerce.number().describe('distance'),
	z.literal('mi').or(z.literal('km')).describe(`'mi' or 'km'`),
])

interface MarkItem {
	value: number
	dist: number
	label: string
}
const findClosestItemIndex = (number: number, list: MarkItem[]): number => {
	let closestIndex: number | null = null
	let minDiff = Infinity

	for (let i = 0; i < list.length; i++) {
		const item = list.at(i) as MarkItem
		const diff = Math.abs(number - item.dist)

		if (diff < minDiff) {
			minDiff = diff
			closestIndex = i
		}
	}

	return closestIndex ?? 0
}

const coerceBoolean = (value?: string | string[] | boolean) =>
	typeof value === 'boolean' ? value : typeof value === 'string' && value === 'true'

export const SearchDistance = () => {
	const router = useRouter()
	const [_searchType, lon, lat, dist, unit] = ParamSchema.parse(router.query.params)
	const paramArray = [_searchType, String(lon), String(lat), String(dist), unit]
	const { t } = useTranslation('common')
	const marks =
		unit === 'mi'
			? [
					{ value: 0, dist: 10, label: '10 mi' },
					{ value: 1, dist: 25, label: '25 mi' },
					{ value: 2, dist: 50, label: '50 mi' },
					{ value: 3, dist: 100, label: '100 mi' },
					{ value: 4, dist: 250, label: '250 mi' },
			  ]
			: [
					{ value: 0, dist: 20, label: '20 km' },
					{ value: 1, dist: 50, label: '50 km' },
					{ value: 2, dist: 100, label: '100 km' },
					{ value: 3, dist: 250, label: '250 km' },
					{ value: 4, dist: 500, label: '500 km' },
			  ]
	const [distance, setDistance] = useUncontrolled({ defaultValue: findClosestItemIndex(dist, marks) })
	const [extended, setExtended] = useState(coerceBoolean(router.query.extended))

	return (
		<Stack spacing={16}>
			<Stack spacing={16} pb={16}>
				<Title order={3}>{t('words.distance')}</Title>

				<Slider
					value={distance}
					onChange={setDistance}
					onChangeEnd={(idx) => {
						const selectedDist = marks.at(idx)?.dist
						if (selectedDist) {
							router.replace(
								{
									pathname: '/search/[...params]',
									query: {
										...router.query,
										params: [_searchType, lon.toString(), lat.toString(), selectedDist.toString(), unit],
									},
								},
								undefined,
								{ shallow: true }
							)
						}
					}}
					marks={marks}
					min={0}
					max={4}
					step={1}
				/>
			</Stack>
			<Checkbox
				label={t('search.include-remote')}
				checked={extended}
				onChange={(e) => {
					setExtended(e.currentTarget.checked)
					router.replace(
						{
							pathname: '/search/[...params]',
							query: {
								...router.query,
								params: paramArray,
								extended: e.currentTarget.checked.toString(),
							},
						},
						undefined,
						{ shallow: true }
					)
				}}
			/>
		</Stack>
	)
}
