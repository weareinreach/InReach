import {
	Box,
	type ButtonProps,
	Card,
	createPolymorphicComponent,
	createStyles,
	Drawer,
	rem,
	Stack,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
	drawerBody: {
		padding: `${rem(40)} ${rem(32)}`,
		'&:not(:only-child)': {
			paddingTop: rem(40),
		},
	},
}))

const _ServicesDrawer = forwardRef<HTMLButtonElement, ServicesDrawerProps>((props, ref) => {
	const [opened, handler] = useDisclosure(true)
	const { id: organizationId, slug: orgSlug } = useOrgInfo()
	const { classes } = useStyles()
	const { data, isLoading } = api.service.forServiceDrawer.useQuery(
		{ organizationId: organizationId ?? '' },
		{ enabled: Boolean(organizationId), refetchOnWindowFocus: false }
	)

	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Breadcrumb option='close' onClick={handler.close} />
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>All services</Title>
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
		</>
	)
})
_ServicesDrawer.displayName = 'ServicesDrawer'

export const ServicesDrawer = createPolymorphicComponent<'button', ServicesDrawerProps>(_ServicesDrawer)

interface ServicesDrawerProps extends ButtonProps {
	x?: string
}
