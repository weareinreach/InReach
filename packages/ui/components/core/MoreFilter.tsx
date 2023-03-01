import {
	Accordion,
	Loader,
	Checkbox,
	createStyles,
	Group,
	Text,
	Title,
	UnstyledButton,
	Modal,
	TitleProps,
	TextProps,
	ScrollArea,
	useMantineTheme,
	ScrollAreaProps,
	Box,
	Skeleton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { Fragment, ReactNode, useEffect, useState } from 'react'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { useModalProps } from '~ui/modals'

import { Button } from './Button'

const RESULT_PLACEHOLDER = 999

const useStyles = createStyles((theme) => ({
	footer: {
		borderTop: 'solid 1px' + theme.other.colors.primary.lightGray,
		margin: '0px -32px',
		padding: '32px 32px 0px 32px',
	},
}))

export const MoreFilter = ({}) => {
	const { data: moreFilterOptionData, status } = api.attribute.getFilterOptions.useQuery()
	const { classes, cx } = useStyles()
	const { t } = useTranslation(['common', 'attribute'])
	const [opened, setOpened] = useState(false)
	const modalSettings = useModalProps()
	const theme = useMantineTheme()

	const resultCount = RESULT_PLACEHOLDER

	console.log(moreFilterOptionData)

	return (
		<Modal>
			<Box className={classes.footer}>
				<Button
					variant='primary'
					style={{ width: '100%', borderRadius: '8px' }}
					onClick={() => setOpened(false)}
				>
					{t('view-x-result', { count: resultCount })}
				</Button>
			</Box>
		</Modal>
	)
}
