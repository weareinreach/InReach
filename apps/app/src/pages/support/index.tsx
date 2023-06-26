import { Divider, Flex, Grid, Stack, Title, useMantineTheme } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'

import { AntiHateMessage } from '@weareinreach/ui/components/core/AntiHateMessage'
import { Icon } from '@weareinreach/ui/icon'
import { getServerSideTranslations } from '~app/utils/i18n'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks'
import { GenericContentModal, PrivacyStatementModal } from '~ui/modals'

const SavedLists = () => {
	const { t } = useTranslation('common')
	const theme = useMantineTheme()

	const variants = useCustomVariant()
	const linkVar = { variant: variants.Link.inlineInvertedUtil1 }
	const support = [
		<Link key={0} href='/suggest' target='_self' {...linkVar}>
			<Flex justify='space-between' py={14}>
				{t('footer.suggest-org')}
				<Icon icon='carbon:chevron-right' height={24} />
			</Flex>
		</Link>,
		<Link key={1} href='https://www.surveymonkey.com/r/96QD8ZQ' external {...linkVar}>
			<Flex justify='space-between' py={14}>
				{t('footer.share-feedback')}
				<Icon icon='carbon:chevron-right' height={24} />
			</Flex>
		</Link>,
		<Link key={2} href='https://inreach.org/vetting-process/' external {...linkVar}>
			<Flex justify='space-between' py={14}>
				{t('footer.vetting-process')}
				<Icon icon='carbon:chevron-right' height={24} />
			</Flex>
		</Link>,
		<PrivacyStatementModal key={3} component={Link} {...linkVar}>
			<Flex justify='space-between' py={14}>
				{t('footer.privacy-statement')}
				<Icon icon='carbon:chevron-right' height={24} />
			</Flex>
		</PrivacyStatementModal>,
		<GenericContentModal key={4} content='antiHate' component={Link} {...linkVar}>
			<Flex justify='space-between' py={14}>
				{t('footer.anti-hate')} <Icon icon='carbon:chevron-right' height={24} />
			</Flex>
		</GenericContentModal>,
		<GenericContentModal key={5} content='accessibilityStatement' component={Link} {...linkVar}>
			<Flex justify='space-between' py={14}>
				{t('footer.digital-accessibility')}
				<Icon icon='carbon:chevron-right' height={24} />
			</Flex>
		</GenericContentModal>,
		<GenericContentModal key={6} content='disclaimer' component={Link} {...linkVar}>
			<Flex justify='space-between' py={14}>
				{t('footer.disclaimer')}
				<Icon icon='carbon:chevron-right' height={24} />
			</Flex>
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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await getServerSideTranslations(locale, ['common', 'attribute'])),
		},
	}
}
export default SavedLists
