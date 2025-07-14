import { Divider, Flex, Grid, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { type GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { type ReactNode } from 'react'

import { donateEvent } from '@weareinreach/analytics/events'
import { AntiHateMessage } from '@weareinreach/ui/components/core/AntiHateMessage'
import { Link } from '@weareinreach/ui/components/core/Link'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { Icon } from '@weareinreach/ui/icon'
import { getServerSideTranslations } from '~app/utils/i18n'

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const GenericContentModal = dynamic(() =>
	import('@weareinreach/ui/modals/GenericContent').then((mod) => mod.GenericContentModal)
)
// @ts-expect-error Next Dynamic doesn't like polymorphic components
const PrivacyStatementModal = dynamic(() =>
	import('@weareinreach/ui/modals/PrivacyStatement').then((mod) => mod.PrivacyStatementModal)
)

const SupportItem = ({ tKey }: SupportItemProps) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	return (
		<Flex justify='space-between' py={14}>
			<Text variant={variants.Text.utility1}>{t(tKey)}</Text>
			<Icon icon='carbon:chevron-right' height={24} />
		</Flex>
	)
}
interface SupportItemProps {
	tKey: string
}

const SupportPage = () => {
	const { t } = useTranslation('common')
	const theme = useMantineTheme()

	const variants = useCustomVariant()
	const linkVar = { variant: variants.Link.inlineInvertedUtil1 }

	const support: [number, ReactNode][] = [
		[
			7,
			<Link
				key={7}
				external
				href='https://inreach.kindful.com/embeds/4d78c071-9369-4a0c-84c7-8e783b21a940'
				onClick={donateEvent.click}
				{...linkVar}
			>
				<SupportItem tKey='donate.to-inreach' />
			</Link>,
		],
		[
			0,
			<Link
				key={0}
				href='/suggest'
				// @ts-expect-error ignore the blank target error
				target='_self'
				{...linkVar}
			>
				<SupportItem tKey='footer.suggest-org' />
			</Link>,
		],
		[
			1,
			<Link key={1} href='https://www.surveymonkey.com/r/96QD8ZQ' external {...linkVar}>
				<SupportItem tKey='footer.share-feedback' />
			</Link>,
		],
		[
			2,
			<Link key={2} href='https://inreach.org/vetting-process/' external {...linkVar}>
				<SupportItem tKey='footer.vetting-process' />
			</Link>,
		],
		[
			3,
			<PrivacyStatementModal key={3} component={Link} {...linkVar}>
				<SupportItem tKey='footer.privacy-statement' />
			</PrivacyStatementModal>,
		],
		[
			4,
			<GenericContentModal key={4} content='antiHate' component={Link} {...linkVar}>
				<SupportItem tKey='footer.anti-hate' />
			</GenericContentModal>,
		],
		[
			5,
			<GenericContentModal key={5} content='accessibilityStatement' component={Link} {...linkVar}>
				<SupportItem tKey='footer.digital-accessibility' />
			</GenericContentModal>,
		],
		[
			6,
			<GenericContentModal key={6} content='disclaimer' component={Link} {...linkVar}>
				<SupportItem tKey='footer.disclaimer' />
			</GenericContentModal>,
		],
	]

	return (
		<Grid.Col xs={12} sm={12}>
			<Stack align='flex-start' spacing={32} w='100%'>
				<Title order={2}>{t('words.support')}</Title>
				<Stack w='100%' spacing={0}>
					{support.map(([key, item]) => (
						<div key={key} style={{ width: '100%' }}>
							{item}
							<Divider w='100%' color={theme.other.colors.tertiary.coolGray} />
						</div>
					))}
				</Stack>
				<AntiHateMessage />
			</Stack>
		</Grid.Col>
	)
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await getServerSideTranslations(locale, ['common', 'attribute'])),
		},
	}
}
export default SupportPage
