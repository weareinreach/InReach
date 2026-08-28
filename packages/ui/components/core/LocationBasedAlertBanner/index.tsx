import { Box, Stack, Text } from '@mantine/core'
import { Trans } from 'next-i18next/pages'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { cx } from '~ui/lib/cx'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

export const LocationBasedAlertBanner = ({ lat, lon, type, onClick }: LocationBasedAlertBannerProps) => {
	const variants = useCustomVariant()

	const { data: locationBasedAlertBannerProps, isLoading } = api.component.LocationBasedAlertBanner.useQuery({
		lat,
		lon,
	})

	if (isLoading || !locationBasedAlertBannerProps) {
		return null
	}

	return (
		<Stack
			gap={0}
			className={cx(
				type === 'primary' ? classes.primaryContainer : undefined,
				type === 'secondary' ? classes.secondaryContainer : undefined
			)}
		>
			{locationBasedAlertBannerProps
				.filter((alertProps) => alertProps.level.toLowerCase().endsWith(type))
				.map((alertProps) => (
					<Box
						className={classes[type]}
						data-alert-level={alertProps.level}
						key={alertProps.id}
						onClick={onClick}
						style={{ cursor: onClick ? 'pointer' : 'default' }}
					>
						<Text>
							<Trans
								i18nKey={alertProps.i18nKey}
								ns={alertProps.ns}
								defaults={alertProps.defaultText}
								components={{
									Link: <Link external variant={variants.Link.inheritStyleUnderline} target='_blank' />,
								}}
							/>
						</Text>
					</Box>
				))}
		</Stack>
	)
}

export type LocationBasedAlertBannerProps = {
	lat: number
	lon: number
	type: 'primary' | 'secondary'
	onClick?: () => void
}
