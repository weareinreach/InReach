import { useTranslation } from 'next-i18next'

import Link from 'next/link'

import { Button, DefaultProps, Selectors, createStyles } from '@mantine/core'

const useStyles = createStyles((theme) => ({
	root: {
		backgroundColor: theme.colors.red,
	},
	label: {
		color: theme.colors.white,
		fontWeight: theme.other.fontWeight.extrabold,
		fontSize: 16,
		paddingLeft: 15,
		paddingRight: 15,
	},
}))

export const SafetyExit = ({ className, classNames, styles, unstyled }: SafetyExitProps) => {
	const { t } = useTranslation('common')
	const { classes } = useStyles(undefined, { name: 'SafetyExit', classNames, styles, unstyled })
	const { root, label } = classes
	return (
		<Link href='about:newtab'>
			<Button className={className} classNames={{ root, label }}>
				{t('safety-exit')}
			</Button>
		</Link>
	)
}
type ComponentStyles = Selectors<typeof useStyles>
type SafetyExitProps = DefaultProps<ComponentStyles>
