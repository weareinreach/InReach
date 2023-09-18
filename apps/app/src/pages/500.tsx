import { Center, Container, rem, Stack, Tabs, Text, Title } from '@mantine/core'
import * as Sentry from '@sentry/nextjs'
import { type GetStaticProps, type NextPage, type NextPageContext } from 'next'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { SearchBox } from '@weareinreach/ui/components/core/SearchBox'
// import { getServerSideTranslations } from '~app/utils/i18n'

const ServerError: NextPage = () => {
	const [isLoading, setLoading] = useState(false)
	const { t } = useTranslation('common')

	return (
		<Container>
			<Stack
				m={{ base: `${rem(48)} ${rem(0)}`, xs: `${rem(80)} ${rem(0)}`, sm: `${rem(100)} ${rem(0)}` }}
				align='center'
				spacing={32}
			>
				<Stack spacing={0} align='center'>
					{/* eslint-disable-next-line i18next/no-literal-string */}
					<Title order={1}>🔦</Title>
					<Title order={1}>{t('errors.500-title')}</Title>
				</Stack>
				<Text ta='center'>{t('errors.500-body')}</Text>
				<Tabs defaultValue='location' w='100%' maw={636}>
					<Tabs.List grow position='apart'>
						<Tabs.Tab value='location'>{t('common:words.location')}</Tabs.Tab>
						<Tabs.Tab value='name'>{t('common:words.organization')}</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='location' m={0}>
						<Center>
							<SearchBox
								type='location'
								loadingManager={{ isLoading, setLoading }}
								placeholderTextKey='search.location-placeholder-searchby'
							/>
						</Center>
					</Tabs.Panel>
					<Tabs.Panel value='name' m={0}>
						<SearchBox
							type='organization'
							loadingManager={{ isLoading, setLoading }}
							placeholderTextKey='search.organization-placeholder-searchby'
						/>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</Container>
	)
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	const getServerSideTranslations = await import('../utils/i18n').then((mod) => mod.getServerSideTranslations)
	return {
		props: {
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}
export const getInitialProps = async (ctx: NextPageContext) => {
	await Sentry.captureUnderscoreErrorException(ctx)
}

export default ServerError
