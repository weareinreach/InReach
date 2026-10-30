import { Stack, Textarea, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useCallback } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { trpc as api } from '~ui/lib/trpcClient'

const ZFormSchema = z.object({
	baseUrl: z.string().min(1, 'A base URL is required.'),
	description: z.string().min(1, 'A description is required.'),
})
type FormValues = z.infer<typeof ZFormSchema>

/**
 * Add/Edit form for a base-URL exception, shared by `AddOrgUrlDuplicateExceptionModal` (the standalone "Add
 * Base URL" trigger) and the table's own Edit row action - same fields and validation either way, just
 * pre-filled and calling `update` instead of `create` when editing an existing row.
 */
export const OrgUrlDuplicateExceptionForm = ({
	existing,
	onSettled,
}: {
	existing?: { id: string; baseUrl: string; description: string }
	onSettled: () => void
}) => {
	const apiUtils = api.useUtils()

	const form = useForm<FormValues>({
		validate: schemaResolver(ZFormSchema, { sync: true }),
		validateInputOnBlur: true,
		initialValues: { baseUrl: existing?.baseUrl ?? '', description: existing?.description ?? '' },
	})

	const handleSettled = useCallback(() => {
		apiUtils.orgUrlDuplicateException.forTable.invalidate()
		onSettled()
	}, [apiUtils, onSettled])

	// Without this, a failed mutation (e.g. the base URL is already on the list, or any other server error)
	// was completely silent - the submit button just stopped loading, with nothing telling the user it
	// didn't actually work.
	const handleError = useCallback(
		(error: { message: string }) => {
			form.setFieldError('baseUrl', error.message)
		},
		[form]
	)

	const create = api.orgUrlDuplicateException.create.useMutation({
		onSuccess: handleSettled,
		onError: handleError,
	})
	const update = api.orgUrlDuplicateException.update.useMutation({
		onSuccess: handleSettled,
		onError: handleError,
	})
	const isPending = existing ? update.isPending : create.isPending

	const handleSubmit = form.onSubmit((values) => {
		if (existing) {
			update.mutate({ id: existing.id, ...values })
		} else {
			create.mutate(values)
		}
	})

	return (
		<form onSubmit={handleSubmit}>
			<Stack gap='sm'>
				<TextInput
					label='Base URL'
					placeholder='example.com'
					description="Enter just the domain to exempt the whole site, or add a path to exempt only that section, e.g. 'example.com/doctors'."
					required
					{...form.getInputProps('baseUrl')}
				/>
				<Textarea
					label='Description'
					placeholder="Why is this domain's duplicate check being exempted?"
					required
					minRows={3}
					{...form.getInputProps('description')}
				/>
				<Button type='submit' loading={isPending} fullWidth>
					{existing ? 'Save' : 'Add'}
				</Button>
			</Stack>
		</form>
	)
}
