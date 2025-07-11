/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from 'react'

import { convertToCsv } from '~ui/utils/csv'

interface UseCsvDownloadOptions {
	fileName: string
	onSuccess?: () => void
	onError?: (error: string) => void
}

export const useCsvDownload = <T extends Record<string, any>>({
	fileName,
	onSuccess,
	onError,
}: UseCsvDownloadOptions) => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const download = useCallback(
		async (dataToExport: T[]) => {
			setIsLoading(true)
			setError(null)

			try {
				if (!dataToExport || dataToExport.length === 0) {
					throw new Error('No data provided for CSV download.')
				}
				convertToCsv(dataToExport, fileName)
				onSuccess?.()
			} catch (err: any) {
				console.error('CSV Download Error:', err)
				const errorMessage = `Failed to download CSV: ${err.message || 'Unknown error'}`
				setError(errorMessage)
				onError?.(errorMessage)
			} finally {
				setIsLoading(false)
			}
		},
		[fileName, onSuccess, onError]
	)

	return { download, isLoading, error }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
