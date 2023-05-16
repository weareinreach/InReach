import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Group,
	Modal,
	Stack,
	TextInput,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

import { Button } from '~ui/components/core/Button'
import { PhoneNumberEntry } from '~ui/components/data-portal/PhoneNumberEntry'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { formHookParams, PhoneEmailFormProvider, useForm } from './context'
import { PhoneEmailFlags, PhoneTypeSelect } from './fields'

const PhoneEmailModalBody = forwardRef<HTMLButtonElement, PhoneEmailModalProps>(({ role, ...props }, ref) => {
	const savePhone = api.orgPhone.create.useMutation()
	const saveEmail = api.orgEmail.create.useMutation()
	const form = useForm(formHookParams)
	const [opened, handler] = useDisclosure(false)
	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />
	const slug = useSlug()

	const handleSubmit = () => {
		if (!form.isValid()) return
		const formValues = form.getTransformedValues()
		const { orgLocationId, orgServiceId, isPrimary, published } = formValues
		switch (role) {
			case 'email': {
				const { emailAddress: email, firstName, lastName } = formValues
				if (!email) return
				saveEmail.mutate({
					orgSlug: slug,
					data: { email, firstName, lastName, locationOnly: false, serviceOnly: false },
				})
				break
			}
			case 'phone': {
				const { phoneNumber: number, phoneCountryId: countryId, phoneTypeId, customPhoneType } = formValues
				if (!number || !countryId) return

				savePhone.mutate({ orgSlug: slug, data: { number, countryId, phoneTypeId } })

				break
			}
		}
	}

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close}>
				<PhoneEmailFormProvider form={form}>
					<Stack>
						<Title order={2}>Add new {role === 'email' ? 'email' : 'phone number'}</Title>
						<Stack spacing={0}>
							{role === 'email' ? (
								<>
									<TextInput label='Email' {...form.getInputProps('emailAddress')} />
									<Group noWrap>
										<TextInput label='First name' {...form.getInputProps('firstName')} />
										<TextInput label='Last name' {...form.getInputProps('lastName')} />
									</Group>
									<TextInput label='Job Title' {...form.getInputProps('emailDesc')} />
								</>
							) : (
								<>
									<PhoneNumberEntry
										phoneEntryProps={{
											...form.getInputProps('phoneNumber'),
											setError: (err) => form.setFieldError('phoneNumber', err),
										}}
										countrySelectProps={form.getInputProps('phoneCountryId')}
									/>
									<PhoneTypeSelect />
								</>
							)}
						</Stack>
						<PhoneEmailFlags role={role} />
					</Stack>
				</PhoneEmailFormProvider>
				<Button onClick={handleSubmit}>Save</Button>
			</Modal>
			<Box component='button' ref={ref} onClick={handler.open} {...props} />
		</>
	)
})
PhoneEmailModalBody.displayName = 'PhoneEmailModal'

export const PhoneEmailModal = createPolymorphicComponent<'button', PhoneEmailModalProps>(PhoneEmailModalBody)
export interface PhoneEmailModalProps extends ButtonProps {
	role: 'phone' | 'email'
}
