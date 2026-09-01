import { Box, Modal, Title, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { forwardRef, useCallback } from 'react'

import { Button, type ButtonProps } from '~ui/components/core/Button'
import { SuggestOrg } from '~ui/components/sections/SuggestOrg'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

type OnDataPortalSave = NonNullable<React.ComponentProps<typeof SuggestOrg>['onDataPortalSave']>

/**
 * Self-contained trigger for the "Add an organization" flow - same fields/validation/duplicate-check as the
 * public Suggest-an-Org form (`SuggestOrg`, `variant="dataPortal"`), opened from a modal instead of a page,
 * with three save behaviors instead of one submit button.
 */
export const AddOrgModal = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const apiUtils = api.useUtils()
	const router = useRouter()
	const notifyCreated = useNewNotification({ displayText: 'Organization created', icon: 'success' })

	const handleDataPortalSave = useCallback<OnDataPortalSave>(
		(mode, created) => {
			apiUtils.organization.forOrganizationTable.invalidate()
			switch (mode) {
				case 'save':
					handler.close()
					break
				case 'saveAndEdit':
					handler.close()
					router.push({ pathname: '/org/[slug]/edit', query: { slug: created.slug } })
					break
				case 'saveAndNew':
					notifyCreated()
					break
			}
		},
		[apiUtils, router, handler, notifyCreated]
	)

	return (
		<>
			{/* Built with Modal.Root/Header/Body instead of the <Modal title=.../> shorthand so the close
			    control can sit upper-left (matching this component family's existing ModalTitle/Breadcrumb
			    "close" convention - see SuggestOrg's own thank-you modal and the ServiceTypes/Communities
			    modals) instead of Mantine's default upper-right, and the theme's app-wide
			    `withCloseButton: false` default (packages/ui/theme/common.tsx) simply doesn't apply since
			    this builds the header manually. */}
			<Modal.Root opened={opened} onClose={handler.close} size='lg'>
				<Modal.Overlay />
				<Modal.Content>
					<Modal.Header>
						<UnstyledButton onClick={handler.close} aria-label='Close'>
							<Icon icon='carbon:close' height={24} />
						</UnstyledButton>
						{/* A real <Title order={2}> (matching PageHeading's own heading style) rather than
						    Modal.Title's unstyled default, so this carries the same bold weight as every
						    other Data Portal heading. */}
						<Modal.Title style={{ flex: 1 }}>
							<Title order={2} ta='center'>
								Add an organization
							</Title>
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<SuggestOrg variant='dataPortal' onDataPortalSave={handleDataPortalSave} />
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>
			<Box component={Button} onClick={handler.open} ref={ref} {...props} />
		</>
	)
})
AddOrgModal.displayName = 'AddOrgModal'
