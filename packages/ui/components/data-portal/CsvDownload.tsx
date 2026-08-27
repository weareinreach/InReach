// components/core/ActionButtons/CsvDownload.tsx

import { ActionIcon, Tooltip, useMantineTheme } from '@mantine/core'
import { type UseMutationResult } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { type Permission } from '@weareinreach/db/generated/permission'
import { useCsvDownload } from '~ui/hooks/useCsvDownload'
import { Icon } from '~ui/icon'

interface CsvDownloadProps {
	label: string
	fileName: string
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	useMutationHook: (options?: any) => UseMutationResult<any, any, void, any>
	permissionKey?: Permission | Permission[]
}

// Helper to check permissions with hierarchy support (Additive Permissions)
const checkHierarchyPermission = (userPerms: string[], requiredPerm: string) => {
	// Root/System bypass
	if (userPerms.some((p) => ['root', 'sysadmin', 'system'].includes(p))) return true

	// Hierarchy: Admin > Manager > Basic
	if (requiredPerm === 'dataPortalManager') {
		return userPerms.includes('dataPortalManager') || userPerms.includes('dataPortalAdmin')
	}
	if (requiredPerm === 'dataPortalBasic') {
		return (
			userPerms.includes('dataPortalBasic') ||
			userPerms.includes('dataPortalManager') ||
			userPerms.includes('dataPortalAdmin')
		)
	}
	// Default exact match
	return userPerms.includes(requiredPerm)
}

export const CsvDownload: React.FC<CsvDownloadProps> = ({
	label,
	fileName,
	useMutationHook,
	permissionKey,
}) => {
	const theme = useMantineTheme()
	const { data: session } = useSession()

	let hasRequiredPermissions = true
	if (permissionKey) {
		const requiredPermissions = Array.isArray(permissionKey) ? permissionKey : [permissionKey]

		hasRequiredPermissions = requiredPermissions.every((perm) => {
			const userPerms = session?.user?.permissions || []
			return checkHierarchyPermission(userPerms, perm)
		})
	}
	const hasPermission = hasRequiredPermissions

	const {
		mutate: fetchDataAndDownload,
		isPending: isMutationLoading,
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
		<Tooltip label={currentError || `Download ${label} data`} withinPortal>
			<ActionIcon variant='subtle' onClick={handleClick} loading={isLoading} disabled={isLoading}>
				<Icon
					icon='carbon:download'
					color={currentError ? theme.other.colors.tertiary.red : theme.other.colors.primary.allyGreen}
				/>
			</ActionIcon>
		</Tooltip>
	)
}
