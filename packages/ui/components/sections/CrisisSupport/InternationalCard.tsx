import { Card, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { Trans, useTranslation } from 'next-i18next/pages'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { parsePhoneNumber } from '~ui/hooks/usePhoneNumber'

import classes from './shared.module.css'

export const InternationalCard = ({
	data,
}: {
	data: NonNullable<ApiOutput['organization']['getIntlCrisis']>[number]
}) => {
	const { accessInstructions, description, id, name, services, targetPop } = data
	const theme = useMantineTheme()
	const variant = useCustomVariant()
	const { t, ready } = useTranslation(['common', 'attribute', id])

	return (
		<Skeleton visible={!ready} radius={16}>
			<Card className={classes.cardShadow}>
				<Stack gap={16}>
					{Boolean(services?.length) && (
						<Badge.Group>
							{services?.map(({ tsKey }, i) => (
								<Badge.Service key={`${i}-${tsKey}`} hideTooltip>
									{t(tsKey, { ns: 'services' })}
								</Badge.Service>
							))}
						</Badge.Group>
					)}
					<Title order={2}>{name}</Title>
					{!!description.key && !!description.text && (
						<Text color={theme.other.colors.secondary.darkGray}>
							{t(description.key, { ns: id, defaultValue: description.text })}
						</Text>
					)}
					{!!targetPop?.tsKey && !!targetPop.text && (
						<Trans
							i18nKey='common:crisis-support.who-this-serves'
							components={{ Text: <Text color={theme.other.colors.secondary.darkGray}></Text> }}
							t={t}
							values={{ targetPop: t(`${id}:${targetPop.tsKey}`, { defaultValue: targetPop.text }) }}
						/>
					)}
					{!!accessInstructions?.length && (
						<Stack gap={12} p={16} className={classes.getHelpCard}>
							<Title order={3}>{t('common:service.get-help')}</Title>
							{accessInstructions.map(({ access_type, access_value }, i) => {
								const parseValue = () => {
									switch (access_type) {
										case 'email': {
											return (
												<Link
													href={`mailto:${access_value}`}
													external
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												>
													{access_value}
												</Link>
											)
										}
										case 'link': {
											if (!isExternal(access_value)) return null
											const protocol = /^https?:\/\//i
											return (
												<Link
													href={access_value}
													external
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
													style={{ overflowWrap: 'anywhere', whiteSpace: 'normal' }}
												>
													{access_value.replace(protocol, '')}
												</Link>
											)
										}
										case 'phone': {
											const parsed = parsePhoneNumber(access_value, 'US')
											const linkHref = parsed?.getURI()
											if (!parsed || !isExternal(linkHref)) return null
											return (
												<Link
													href={linkHref}
													external
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												>
													{parsed.formatInternational()}
												</Link>
											)
										}
									}
								}
								const getLabel = (accessType: typeof access_type) => {
									switch (accessType) {
										case 'email': {
											return t('common:words.email').toLowerCase()
										}
										case 'link': {
											return t('common:words.website').toLowerCase()
										}
										case 'phone': {
											return t('common:words.phone').toLowerCase()
										}
									}
								}

								return accessInstructions.length === 1 ? (
									parseValue()
								) : (
									<Stack gap={0} key={`${i}-${access_type}`}>
										{parseValue()}
										<Text color={theme.other.colors.secondary.darkGray}>{getLabel(access_type)}</Text>
									</Stack>
								)
							})}
						</Stack>
					)}
				</Stack>
			</Card>
		</Skeleton>
	)
}
