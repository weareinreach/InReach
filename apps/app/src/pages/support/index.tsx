import { Divider, Flex, Grid, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { type GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'

import { AntiHateMessage } from '@weareinreach/ui/components/core/AntiHateMessage'
import { Link } from '@weareinreach/ui/components/core/Link'
import { useCustomVariant } from '@weareinreach/ui/hooks'
import { Icon } from '@weareinreach/ui/icon'
// import { GenericContentModal, PrivacyStatementModal } from '@weareinreach/ui/modals'
import { getServerSideTranslations } from '~app/utils/i18n'

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const GenericContentModal = dynamic(() =>
	import('@weareinreach/ui/modals/GenericContent').then((mod) => mod.GenericContentModal)
)
// @ts-expect-error Next Dynamic doesn't like polymorphic components
const PrivacyStatementModal = dynamic(() =>
	import('@weareinreach/ui/modals/PrivacyStatement').then((mod) => mod.PrivacyStatementModal)
)

const DonateModal = dynamic(() =>
	import('@weareinreach/ui/components/core/Donate').then((mod) => mod.DonateModal)
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
	const support = [
		<DonateModal key={7}>
			<SupportItem tKey='donate.to-inreach' />
		</DonateModal>,
		<Link key={0} href='/suggest' target='_self' {...linkVar}>
			<SupportItem tKey='footer.suggest-org' />
		</Link>,
		<Link key={1} href='https://www.surveymonkey.com/r/96QD8ZQ' external {...linkVar}>
			<SupportItem tKey='footer.share-feedback' />
		</Link>,
		<Link key={2} href='https://inreach.org/vetting-process/' external {...linkVar}>
			<SupportItem tKey='footer.vetting-process' />
		</Link>,
		<PrivacyStatementModal key={3} component={Link} {...linkVar}>
			<SupportItem tKey='footer.privacy-statement' />
		</PrivacyStatementModal>,
		<GenericContentModal key={4} content='antiHate' component={Link} {...linkVar}>
			<SupportItem tKey='footer.anti-hate' />
		</GenericContentModal>,
		<GenericContentModal key={5} content='accessibilityStatement' component={Link} {...linkVar}>
			<SupportItem tKey='footer.digital-accessibility' />
		</GenericContentModal>,
		<GenericContentModal key={6} content='disclaimer' component={Link} {...linkVar}>
			<SupportItem tKey='footer.disclaimer' />
		</GenericContentModal>,
	]

	return (
		<Grid.Col xs={12} sm={12}>
			<Stack align='flex-start' spacing={32} w='100%'>
				<Title order={2}>{t('words.support')}</Title>
				<Stack w='100%' spacing={0}>
					{support.map((item, i) => (
						<div key={i} style={{ width: '100%' }}>
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
