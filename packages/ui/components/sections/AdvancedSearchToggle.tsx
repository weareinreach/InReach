import { Group, Switch } from '@mantine/core'
import { useEffect, useState } from 'react'

import classes from './AdvancedSearchToggle.module.css'

export const AdvancedSearchToggle = () => {
	// Determine initial state from local storage or default to false
	const [checked, setChecked] = useState(false)

	useEffect(() => {
		const savedMode = localStorage.getItem('ir_advanced_mode')
		setChecked(savedMode === 'true')
	}, [])

	const handleToggle = () => {
		const nextValue = !checked
		setChecked(nextValue)

		if (typeof window !== 'undefined') {
			// 1. Set the parameter so the UI knows to show advanced options
			localStorage.setItem('ir_advanced_mode', nextValue.toString())

			localStorage.setItem('ir_search_version', nextValue ? 'v2' : 'v1')

			// 3. Dispatch a custom event so other components can react to the change immediately
			window.dispatchEvent(new Event('ir_advanced_mode_changed'))
		}
	}

	return (
		<Group gap={8} justify='flex-end'>
			<Switch
				label='Advanced Search'
				classNames={{ label: classes.label }}
				checked={checked}
				onChange={handleToggle}
			/>
		</Group>
	)
}
