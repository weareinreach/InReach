// components/core/ActionButtons/CsvDownload.tsx

import { Text, Tooltip } from '@mantine/core'
import { type UseMutationResult } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { checkPermissions } from '@weareinreach/auth'
import { type Permission } from '@weareinreach/db/generated/permission'
import { Button } from '~ui/components/core/Button'
import { useCsvDownload } from '~ui/hooks/useCsvDownload'
import { Icon } from '~ui/icon'

interface CsvDownloadProps {
	label: string
	fileName: string
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	useMutationHook: (options?: any) => UseMutationResult<any, any, void, any>
	permissionKey?: Permission | Permission[]
}

export const CsvDownload: React.FC<CsvDownloadProps> = ({
	label,
	fileName,
	useMutationHook,
	permissionKey,
}) => {
	const { data: session } = useSession()

	let hasRequiredPermissions = true
	if (permissionKey) {
		const requiredPermissions = Array.isArray(permissionKey) ? permissionKey : [permissionKey]

		hasRequiredPermissions = requiredPermissions.every((perm) => {
			return checkPermissions({ session, permissions: perm, has: 'some' })
		})
	}
	const hasPermission = hasRequiredPermissions

	const {
		mutate: fetchDataAndDownload,
		isLoading: isMutationLoading,
		isSuccess: isMutationSuccess,
		data: mutationData,
		error: mutationError,
	} = useMutationHook()

	const {
		download,
		isLoading: isDownloadProcessing,
		error: downloadError,
	} = useCsvDownload({
		fileName,
		onSuccess: () => console.log(`${label} CSV download initiated on client.`),
		onError: (err) => console.error(`${label} CSV download failed (client-side):`, err),
	})

	useEffect(() => {
		if (isMutationSuccess && mutationData) {
			download(mutationData)
		}
		if (mutationError) {
			console.error(`${label} API call failed:`, mutationError)
		}
	}, [isMutationSuccess, mutationData, mutationError, download, label])

	const isLoading = isMutationLoading || isDownloadProcessing
	const currentError = mutationError ? mutationError.message : downloadError

	const handleClick = () => {
		if (!isLoading) {
			fetchDataAndDownload()
		}
	}
	if (!hasPermission) {
		return null
	}

	return (
		<>
			<Tooltip label={`Download ${label} data`} withinPortal>
				<Button
					onClick={handleClick}
					disabled={isLoading}
					loading={isLoading}
					leftIcon={<Icon icon='carbon:download' />}
					variant='secondary-icon'
					size='compact-xs'
				>
					<Text size='sm'>{label}</Text>
				</Button>
			</Tooltip>
			{currentError && (
				<Text color='red' size='sm' mt={4}>
					{currentError}
				</Text>
			)}
		</>
	)
}
