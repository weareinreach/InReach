import {
	Anchor,
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	Group,
	Modal,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
	Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef, useEffect, useRef, useState } from 'react'

import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

// Strips a leading "Copy of " from the source name before prepending a fresh one, so duplicating an
// existing copy collapses back to `Copy of X` instead of compounding into `Copy of Copy of X`.
const suggestName = (sourceName: string) => `Copy of ${sourceName.replace(/^copy of /i, '')}`

const DEFAULT_COPY_OPTIONS = {
	attributes: true,
	hours: true,
	contactInfo: true,
	coverageArea: true,
	serviceTags: true,
}

// The drawer shows these as separate sections, but they're all stored the same way underneath
// (an AttributeSupplement row per item, differing only in which attribute they reference) - one
// "Attributes" checkbox covers all of them, so the tooltip spells out what that actually means
// rather than leaving staff to guess.
const COPY_OPTION_DESCRIPTIONS = {
	attributes:
		'Get Help, Clients Served, Cost, Eligibility Requirements (including "other, please describe"), Languages, and Additional Information',
	hours: 'Days and hours this service is available',
	contactInfo: 'Phone numbers, emails, and websites linked to this service',
	coverageArea: 'Countries and districts this service covers',
	serviceTags: 'Category tags shown on this service',
}

const _DuplicateServiceModal = forwardRef<HTMLButtonElement, DuplicateServiceModalProps>(
	({ sourceServiceId, onSuccess, ...props }, ref) => {
		const [opened, handler] = useDisclosure(false)
		const [name, setName] = useState('')
		const [nameTouched, setNameTouched] = useState(false)
		const [description, setDescription] = useState('')
		const [copyOptions, setCopyOptions] = useState(DEFAULT_COPY_OPTIONS)
		const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([])
		const hasInitialized = useRef(false)
		const apiUtils = api.useUtils()
		const notifySave = useNewNotification({ displayText: 'Duplicated', icon: 'success' })
		const notifyError = useNewNotification({
			displayText: 'Something went wrong duplicating this service. Please try again.',
			icon: 'warning',
		})

		const { data } = api.service.forDuplicateWizard.useQuery(sourceServiceId, { enabled: opened })

		useEffect(() => {
			if (!opened) {
				hasInitialized.current = false
				setName('')
				setDescription('')
				return
			}
			if (data && !hasInitialized.current) {
				hasInitialized.current = true
				setCopyOptions(DEFAULT_COPY_OPTIONS)
				setSelectedLocationIds(data.locations.map(({ id }) => id))
			}
		}, [opened, data])

		// Shown as a placeholder only, never committed as the actual value - staff must type a real
		// name themselves before they can confirm, even if what they type is this exact suggestion.
		const suggestedName = data ? suggestName(data.name) : ''

		const duplicateService = api.service.duplicate.useMutation({
			onSuccess: (result) => {
				notifySave()
				apiUtils.location.invalidate()
				apiUtils.service.invalidate()
				handler.close()
				onSuccess?.(result.id)
			},
			onError: () => {
				notifyError()
			},
		})

		const locations = data?.locations ?? []
		const showLocationPicker = locations.length > 1
		const nameIsBlank = !name.trim()

		const handleConfirm = () => {
			if (nameIsBlank) return
			duplicateService.mutate({
				sourceServiceId,
				name: name.trim(),
				description: description.trim() || undefined,
				copyOptions,
				locationIds: showLocationPicker ? selectedLocationIds : locations.map(({ id }) => id),
			})
		}

		return (
			<>
				<Modal
					title={<ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />}
					opened={opened}
					onClose={handler.close}
				>
					<Stack>
						<Title order={2}>Duplicate service</Title>
						<TextInput
							label='Service Name'
							required
							placeholder={suggestedName}
							value={name}
							onChange={(event) => setName(event.currentTarget.value)}
							onBlur={() => setNameTouched(true)}
							error={nameTouched && nameIsBlank ? 'Name is required' : undefined}
						/>
						<Textarea
							label='Description'
							placeholder='Optional'
							minRows={2}
							value={description}
							onChange={(event) => setDescription(event.currentTarget.value)}
						/>
						<Stack gap={4}>
							<Group justify='space-between'>
								<Text fw={500} size='sm'>
									What to copy
								</Text>
								<Anchor
									component='button'
									type='button'
									size='sm'
									underline='always'
									onClick={() =>
										setCopyOptions({
											attributes: false,
											hours: false,
											contactInfo: false,
											coverageArea: false,
											serviceTags: false,
										})
									}
								>
									Uncheck all
								</Anchor>
							</Group>
							<Tooltip label={COPY_OPTION_DESCRIPTIONS.attributes} multiline w={280} withArrow>
								<Checkbox
									label='Attributes'
									checked={copyOptions.attributes}
									onChange={(event) => {
										const checked = event.currentTarget.checked
										setCopyOptions((prev) => ({ ...prev, attributes: checked }))
									}}
								/>
							</Tooltip>
							<Tooltip label={COPY_OPTION_DESCRIPTIONS.hours} withArrow>
								<Checkbox
									label='Hours'
									checked={copyOptions.hours}
									onChange={(event) => {
										const checked = event.currentTarget.checked
										setCopyOptions((prev) => ({ ...prev, hours: checked }))
									}}
								/>
							</Tooltip>
							<Tooltip label={COPY_OPTION_DESCRIPTIONS.contactInfo} withArrow>
								<Checkbox
									label='Contact info'
									checked={copyOptions.contactInfo}
									onChange={(event) => {
										const checked = event.currentTarget.checked
										setCopyOptions((prev) => ({ ...prev, contactInfo: checked }))
									}}
								/>
							</Tooltip>
							<Tooltip label={COPY_OPTION_DESCRIPTIONS.coverageArea} withArrow>
								<Checkbox
									label='Coverage area'
									checked={copyOptions.coverageArea}
									onChange={(event) => {
										const checked = event.currentTarget.checked
										setCopyOptions((prev) => ({ ...prev, coverageArea: checked }))
									}}
								/>
							</Tooltip>
							<Tooltip label={COPY_OPTION_DESCRIPTIONS.serviceTags} withArrow>
								<Checkbox
									label='Service tags'
									checked={copyOptions.serviceTags}
									onChange={(event) => {
										const checked = event.currentTarget.checked
										setCopyOptions((prev) => ({ ...prev, serviceTags: checked }))
									}}
								/>
							</Tooltip>
						</Stack>
						{showLocationPicker && (
							<Stack gap={4}>
								<Group justify='space-between'>
									<Text fw={500} size='sm'>
										Link the duplicate to
									</Text>
									<Anchor
										component='button'
										type='button'
										size='sm'
										underline='always'
										onClick={() => setSelectedLocationIds([])}
									>
										Uncheck all
									</Anchor>
								</Group>
								{locations.map((location) => (
									<Checkbox
										key={location.id}
										label={location.name}
										checked={selectedLocationIds.includes(location.id)}
										onChange={(event) => {
											const checked = event.currentTarget.checked
											setSelectedLocationIds((prev) =>
												checked ? [...prev, location.id] : prev.filter((id) => id !== location.id)
											)
										}}
									/>
								))}
							</Stack>
						)}
						<Button
							onClick={handleConfirm}
							loading={duplicateService.isPending}
							disabled={nameIsBlank || duplicateService.isPending}
						>
							Create duplicate
						</Button>
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={handler.open} {...props} />
			</>
		)
	}
)
_DuplicateServiceModal.displayName = 'DuplicateServiceModal'

export const DuplicateServiceModal = createPolymorphicComponent<'button', DuplicateServiceModalProps>(
	_DuplicateServiceModal
)

export interface DuplicateServiceModalProps extends ButtonProps {
	sourceServiceId: string
	/**
	 * Called with the new service's id once duplication succeeds - the caller opens its own follow-up edit
	 * drawer for it, since this component intentionally doesn't import ServiceEditDrawer itself (that file is
	 * expected to render this trigger, which would make the import circular).
	 */
	onSuccess?: (newServiceId: string) => void
}
