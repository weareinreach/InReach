import {
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	createStyles,
	Drawer,
	Group,
	Radio,
	rem,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef, useEffect } from 'react'
import reactStringReplace from 'react-string-replace'
import { z } from 'zod'

import { ApiInput, ApiOutput } from '@weareinreach/api'
import { transformFalseToNull, transformNullString } from '@weareinreach/api/schemas/common'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { MultiSelectPopover } from './MultiSelectPopover'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '33vw',
	},
	drawerBody: {
		padding: `${rem(40)} ${rem(32)}`,
		'&:not(:only-child)': {
			paddingTop: rem(40),
		},
	},
	unmatchedText: {
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
	},
	matchedText: {
		color: theme.other.colors.secondary.black,
	},
}))

const FormSchema = z.object({
	id: z.string(),
	data: z
		.object({
			name: z.string().nullable(),
			street1: z.string(),
			street2: z.string().nullable().transform(transformNullString),
			city: z.string(),
			postCode: z.string().nullable().transform(transformNullString),
			primary: z.coerce.boolean(),
			mailOnly: z.coerce.boolean().nullable(),
			longitude: z.coerce.number().nullable(),
			latitude: z.coerce.number().nullable(),
			geoWKT: z.string().nullable().transform(transformNullString),
			published: z.coerce.boolean(),
			deleted: z.coerce.boolean(),
			accessible: z.object({
				supplementId: z.string().optional(),
				boolean: z.coerce.boolean().nullish(),
			}),
			services: z.string().array(),
		})
		.partial(),
})
type FormSchema = z.infer<typeof FormSchema>

interface AutocompleteItem {
	value: string
	name?: string
	slug?: string
	subheading?: string
	placeId?: string
}

const _AddressDrawer = forwardRef<HTMLButtonElement, AddressDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const form = useForm<FormSchema>({ validate: zodResolver(FormSchema) })
	const { id: organizationId, slug: orgSlug } = useOrgInfo()
	const { t } = useTranslation(['attribute'])
	const { classes } = useStyles()
	const apiUtils = api.useContext()
	const { data, isLoading } = api.location.getAddress.useQuery(locationId ?? '', {
		enabled: Boolean(locationId),
		refetchOnWindowFocus: false,
	})

	useEffect(() => {
		if (data && !isLoading) {
			form.setValues(data)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading])
	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			select: (data) => data.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
			refetchOnWindowFocus: false,
		}
	)

	const matchText = (result: string, textToMatch?: string) => {
		if (!textToMatch) return result
		const matcher = new RegExp(`(${textToMatch})`, 'ig')
		const replaced = reactStringReplace(result, matcher, (match, i) => (
			<span key={i} className={classes.matchedText}>
				{match}
			</span>
		))
		return replaced
	}
	const AutoCompleteItem = forwardRef<HTMLDivElement, AutocompleteItem>(
		({ value, ...others }: AutocompleteItem, ref) => {
			return (
				<div ref={ref} {...others}>
					<Text className={classes.unmatchedText} truncate>
						{matchText(value, form.values.data?.street1)}
					</Text>
				</div>
			)
		}
	)
	AutoCompleteItem.displayName = 'AutoCompleteItem'

	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon='carbon:save' />}
								// onClick={handleUpdate}
								// loading={updateEmails.isLoading}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>Edit Location</Title>
							<TextInput label='Name' required {...form.getInputProps('data.name')} />
							<Stack></Stack>
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_AddressDrawer.displayName = 'AddressDrawer'
export const AddressDrawer = createPolymorphicComponent<'button', AddressDrawerProps>(_AddressDrawer)

interface AddressDrawerProps extends ButtonProps {
	locationId?: string
}
