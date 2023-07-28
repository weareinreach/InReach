/* eslint-disable node/no-process-env */
import { usePrevious } from '@mantine/hooks'
import { createClient } from '@vercel/edge-config'
import { useEffect, useState } from 'react'

export const featureFlagClient = createClient(process.env.FEATURE_FLAG_CONFIG)

/**
 * THIS HAS NOT BEEN TESTED YET - DO NOT USE
 *
 * @private
 */

export const useFeatureFlag = () => {
	const [loading, setLoading] = useState(false)
	const [flagValue, setFlagValue] = useState(false)
	const [flag, setFlag] = useState<string>()
	const previousFlag = usePrevious(flag)
	useEffect(() => {
		async function fetchFlag() {
			try {
				setLoading(true)
				if (!flag) {
					setLoading(false)
					return
				}
				const response = await featureFlagClient.get<boolean>(flag)
				setFlagValue(response ?? false)
				setLoading(false)
			} catch (error) {
				setLoading(false)
				console.error(error)
			}
		}
	}, [flag])

	const getFlag = (flag: string) => {
		if (flag === previousFlag) return flagValue
		setFlag(flag)
		if (loading) return
		return flagValue
	}
	return { getFlag, flagIsLoading: loading }
}
