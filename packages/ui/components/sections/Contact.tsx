import { type ApiOutput } from '@weareinreach/api'

export const ContactSection = (props: ContactSectionProps) => {
	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ContactSectionProps = {
	data: {
		websites: PageQueryResult['websites']
		phones: PageQueryResult['phones']
		emails: PageQueryResult['emails']
		socialMedia: PageQueryResult['socialMedia']
	}
}
