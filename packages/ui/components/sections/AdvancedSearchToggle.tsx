import { createStyles, Group, Switch } from '@mantine/core'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const useStyles = createStyles((theme) => ({
	label: {
		fontWeight: 600,
		fontSize: theme.fontSizes.sm,
	},
}))

export const AdvancedSearchToggle = () => {
	const { classes } = useStyles()
	const router = useRouter()

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

			// 2. If turning OFF, we also reset the search version to standard
			if (!nextValue) {
				localStorage.setItem('ir_search_version', 'v1')

				// If we are currently on a V2 route, navigate back to standard
				if (router.pathname.includes('/v2')) {
					const nextPathname = router.pathname.replace('/search/v2', '/search')
					router.push({ pathname: nextPathname as never, query: router.query })
				}
			}

			// 3. Dispatch a custom event so other components can react to the change immediately
			window.dispatchEvent(new Event('ir_advanced_mode_changed'))
		}
	}

	return (
		<Group spacing={8} position='right'>
			<Switch
				label='Advanced Search'
				classNames={{ label: classes.label }}
				checked={checked}
				onChange={handleToggle}
			/>
		</Group>
	)
}
