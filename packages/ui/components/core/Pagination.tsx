import {
	Divider,
	Group,
	Text,
	Pagination as MantinePagination,
	type PaginationProps as MantinePaginationProps,
	createStyles,
	rem,
	Anchor,
} from '@mantine/core'
import { usePagination } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, useState } from 'react'

import { useCustomVariant } from '~ui/hooks'

import { Link } from './Link'

const useStyles = createStyles((theme) => ({
	paginationItem: {
		height: rem(24),
		minWidth: rem(12),
		textAlign: 'center',
	},
	paginationActive: {
		borderBottom: `${rem(2)} solid ${theme.other.colors.secondary.black}`,
		borderRadius: 0,
	},
}))

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>((props, ref) => {
	const { t } = useTranslation('common')
	const router = useRouter()
	const variants = useCustomVariant()
	const currentPage = typeof router.query.page === 'string' ? parseInt(router.query.page) : 1
	const [page, setPage] = useState(currentPage)
	const { classes, cx } = useStyles()

	const pageChangeHandler = (page: number) => {
		setPage(page)
		router.push({ query: { page: page.toString(), params: router.query.params } })
	}

	const paginationController = usePagination({
		total: props.total,
		onChange: (page) => pageChangeHandler(page),
		boundaries: 1,
		siblings: 1,
	})
	const { active: activePage } = paginationController

	const Items = () => {
		const { range, active } = paginationController

		return (
			<Group spacing={12}>
				{range.map((item) => {
					if (item === 'dots')
						return (
							<Text key={item} variant={variants.Text.utility2} className={classes.paginationItem}>
								...
							</Text>
						)
					if (item === active)
						return (
							<Text
								key={item}
								variant={variants.Text.utility1}
								className={cx(classes.paginationItem, classes.paginationActive)}
							>
								{item}
							</Text>
						)
					return (
						<Anchor
							key={item}
							data-active={item === active ? true : undefined}
							className={classes.paginationItem}
							onClick={() => paginationController.setPage(item)}
							variant={variants.Link.pagination}
						>
							{item}
						</Anchor>
					)
				})}
			</Group>
		)
	}

	return (
		<MantinePagination.Root
			value={page}
			onChange={(page) => pageChangeHandler(page)}
			defaultValue={currentPage}
			{...props}
		>
			<Group ref={ref} spacing={24}>
				<Items />
				<Group>
					<Link
						data-disabled={activePage === 1 ? true : undefined}
						variant={variants.Link.pagination}
						className={classes.paginationItem}
						onClick={() => paginationController.previous()}
					>
						{t('words.prev')}
					</Link>
					<Divider orientation='vertical' />
					<Link
						data-disabled={activePage === props.total ? true : undefined}
						variant={variants.Link.pagination}
						className={classes.paginationItem}
						onClick={() => paginationController.next()}
					>
						{t('words.next')}
					</Link>
				</Group>
			</Group>
		</MantinePagination.Root>
	)
})
Pagination.displayName = 'Pagination'

export interface PaginationProps extends MantinePaginationProps {}
