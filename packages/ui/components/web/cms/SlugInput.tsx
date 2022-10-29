import { useDocumentOperation } from 'sanity'
import { FieldMember, MemberField, ObjectInputProps } from 'sanity/form'
import slugify from 'slugify'

import { useCallback, useEffect, useState } from 'react'

import { TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'

export type PageInfoProps = ObjectInputProps<{
	title: string
	slug: string
}>

export const SlugInput = (props: PageInfoProps) => {
	const [slug, setSlug] = useState('')
	const [slugVal] = useDebouncedValue(slug, 200)
	console.log('props', props)
	const { members, renderField, renderInput, renderItem } = props
	const form = useForm({
		initialValues: {
			slug: '',
			title: '',
		},
	})

	// find "mediaTitle" member
	const titleMember = members.find(
		(member): member is FieldMember => member.kind === 'field' && member.name === 'title'
	)
	// find "mediaType" member
	const slugMember = members.find(
		(member): member is FieldMember => member.kind === 'field' && member.name === 'slug'
	)
	const sanityProps = {
		renderField,
		renderInput,
		renderItem,
	}

	useEffect(() => {
		if (slugVal !== form.values.slug) {
			form.setFieldValue('slug', slugVal)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slugVal])

	return (
		<>
			{titleMember && (
				<MemberField
					label='Page Title'
					onChange={(e) => setSlug(slugify(e.target.value))}
					member={titleMember}
					{...sanityProps}
				/>
			)}
			{slugMember && (
				<MemberField
					// style={{ display: "none" }}
					label='slug'
					member={slugMember}
					{...sanityProps}
					// {...form.getInputProps("slug")}
					value={slug}
				/>
			)}
		</>
	)
}
