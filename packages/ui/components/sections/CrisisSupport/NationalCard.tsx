import { Card, createStyles, rem, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { Trans, useTranslation } from 'next-i18next'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { isExternal, Link } from '~ui/components/core/Link'
import { AccessInfo } from '~ui/components/data-display/AccessInfo'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { parsePhoneNumber } from '~ui/hooks/usePhoneNumber'

const useStyles = createStyles((theme) => ({
	getHelpCard: {
		border: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
		borderRadius: rem(16),
	},
	cardShadow: {
		boxShadow: `${rem(0)} ${rem(4)} ${rem(20)} ${rem(0)} rgba(0, 0, 0, 0.1)`,
	},
}))

export const NationalCard = ({
	data,
}: {
	data: NonNullable<ApiOutput['organization']['getNatlCrisis']>[number]
}) => {
	const { accessInstructions, description, id, name, community } = data
	const theme = useMantineTheme()
	const { classes } = useStyles()
	const variant = useCustomVariant()
	const { t, ready } = useTranslation(['common', 'attribute', id])

	return (
		<Skeleton visible={!ready} radius={16}>
			<Card className={classes.cardShadow}>
				<Stack spacing={16}>
					{community?.tsKey && (
						// @ts-expect-error props are too complicated right now.
						<Badge variant='community' tsKey={community.tsKey} icon={community.icon ?? ''} hideToolTip />
					)}
					<Title order={2}>{name}</Title>
					{!!description?.key && !!description?.text && (
						<Text color={theme.other.colors.secondary.darkGray}>
							{t(description.key, { ns: id, defaultValue: description.text })}
						</Text>
					)}
					{!!accessInstructions?.length && (
						<Stack spacing={12} p={16} className={classes.getHelpCard}>
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
									<Stack spacing={0} key={`${i}-${access_type}`}>
										{parseValue()}
										<Text color={theme.other.colors.secondary.darkGray}>
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
