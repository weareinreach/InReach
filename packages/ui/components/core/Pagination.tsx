import {
	Anchor,
	createStyles,
	Divider,
	Group,
	Pagination as MantinePagination,
	type PaginationProps as MantinePaginationProps,
	rem,
	Text,
} from '@mantine/core'
import { usePagination } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useState } from 'react'

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

interface ItemsProps {
	paginationController: ReturnType<typeof usePagination>
}
const Items = ({ paginationController }: ItemsProps) => {
	const { range, active } = paginationController
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()
	const clickHandler = useCallback(
		(pageNum: number) => () => paginationController.setPage(pageNum),
		[paginationController]
	)

	return (
		<Group spacing={12}>
			{range.map((item) => {
				if (item === 'dots') {
					return (
						<Text key={item} variant={variants.Text.utility2} className={classes.paginationItem}>
							...
						</Text>
					)
				}
				if (item === active) {
					return (
						<Text
							key={item}
							variant={variants.Text.utility1}
							className={cx(classes.paginationItem, classes.paginationActive)}
						>
							{item}
						</Text>
					)
				}
				return (
					<Anchor
						key={item}
						data-active={item === active ? true : undefined}
						className={classes.paginationItem}
						onClick={clickHandler(item)}
						variant={variants.Link.pagination}
					>
						{item}
					</Anchor>
				)
			})}
		</Group>
	)
}

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>((props, ref) => {
	const { t } = useTranslation('common')
	const router = useRouter()
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const currentPage = typeof router.query.page === 'string' ? parseInt(router.query.page) : 1
	const [page, setPage] = useState(currentPage)

	const pageChangeHandler = useCallback(
		(pageNum: number) => {
			setPage(pageNum)
			router.replace(
				{ query: { ...router.query, page: pageNum.toString(), params: router.query.params } },
				undefined,
				{
					shallow: true,
					scroll: true,
				}
			)
		},
		[router]
	)

	const paginationController = usePagination({
		total: props.total,
		onChange: pageChangeHandler,
		boundaries: 1,
		siblings: 1,
		initialPage: currentPage,
	})
	const { active: activePage } = paginationController

	return (
		<MantinePagination.Root value={page} onChange={pageChangeHandler} defaultValue={currentPage} {...props}>
			<Group ref={ref} spacing={24} position='apart'>
				<Items paginationController={paginationController} />
				<Group>
					<Link
						data-disabled={activePage === 1 ? true : undefined}
						variant={variants.Link.pagination}
						className={classes.paginationItem}
						onClick={paginationController.previous}
					>
						{t('words.prev')}
					</Link>
					<Divider orientation='vertical' />
					<Link
						data-disabled={activePage === props.total ? true : undefined}
						variant={variants.Link.pagination}
						className={classes.paginationItem}
						onClick={paginationController.next}
					>
						{t('words.next')}
					</Link>
				</Group>
			</Group>
		</MantinePagination.Root>
	)
})
Pagination.displayName = 'Pagination'

export type PaginationProps = MantinePaginationProps
