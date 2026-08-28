import { Card, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next/pages'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { AccessInfo } from '~ui/components/data-display/AccessInfo'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'

import classes from './shared.module.css'

export const NationalCard = ({
	data,
}: {
	data: NonNullable<ApiOutput['organization']['getNatlCrisis']>[number]
}) => {
	const { accessInstructions, description, id, name, community } = data
	const theme = useMantineTheme()
	const variant = useCustomVariant()
	const { t, ready } = useTranslation(['common', 'attribute', id])

	return (
		<Skeleton visible={!ready} radius={16}>
			<Card className={classes.cardShadow}>
				<Stack gap={16}>
					{community?.tsKey && (
						// @ts-expect-error props are too complicated right now.
						<Badge.Community icon={community.icon ?? ''} hideToolTip className={classes.categoryBadge}>
							{t(community.tsKey, { ns: 'attribute' })}
						</Badge.Community>
					)}
					<Title order={2}>{name}</Title>
					{!!description?.key && !!description?.text && (
						<Text c={theme.other.colors.secondary.darkGray}>
							{t(description.key, { ns: id, defaultValue: description.text })}
						</Text>
					)}
					{!!accessInstructions?.length && (
						<Stack gap={12} p={16} className={classes.getHelpCard}>
							<Title order={3}>{t('common:service.get-help')}</Title>
							{accessInstructions.map(({ access_type, access_value, sms_body, key, text }, i) => {
								if (!access_value) return null
								const parseValue = () => {
									switch (access_type) {
										case 'email': {
											return (
												<AccessInfo.Email
													email={access_value}
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												/>
											)
										}
										case 'link': {
											return (
												<AccessInfo.Link
													link={access_value}
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												/>
											)
										}
										case 'phone': {
											return (
												<AccessInfo.Phone
													national
													phone={access_value}
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												/>
											)
										}
										case 'sms': {
											return (
												<AccessInfo.SMS
													code={access_value}
													body={sms_body}
													key={`${i}-${access_type}`}
													variant={variant.Link.inheritStyle}
												/>
											)
										}
										case 'whatsapp': {
											return (
												<AccessInfo.WhatsApp
													phone={access_value}
													key={`${i}-${access_type}`}
													variant={variant.Link.inheritStyle}
												/>
											)
										}
									}
								}

								return (
									<Stack gap={0} key={`${i}-${access_type}`}>
										{parseValue()}
										<Text c={theme.other.colors.secondary.darkGray}>
											{t(key ?? '', { ns: id, defaultValue: text })}
										</Text>
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
