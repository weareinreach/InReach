/* eslint-disable @typescript-eslint/no-explicit-any */
export const convertToCsv = <T extends Record<string, any>>(data: T[], fileName: string) => {
	if (!data || data.length === 0) {
		console.warn('No data to convert to CSV.')
		return
	}

	const headers = Object.keys(data[0]!)

	const csvRows = []
	csvRows.push(headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(','))

	for (const row of data) {
		const values = headers.map((header) => {
			let cellValue = row[header]
			if (cellValue instanceof Date) {
				cellValue = cellValue.toISOString()
			} else if (typeof cellValue === 'object' && cellValue !== null) {
				cellValue = JSON.stringify(cellValue)
			}
			const escaped = ('' + (cellValue ?? '')).replace(/"/g, '""')
			return `"${escaped}"`
		})
		csvRows.push(values.join(','))
	}

	const csvString = csvRows.join('\n')
	const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement('a')
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob)
		link.setAttribute('href', url)
		link.setAttribute('download', `${fileName}.csv`)
		link.style.visibility = 'hidden'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	} else {
		console.error('Download is not supported in this browser.')
	}
}
