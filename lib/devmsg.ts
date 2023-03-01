/* eslint-disable import/no-unused-modules */
import boxen from 'boxen'

const message = boxen(
	`The following dev commands are available:\n\n- pnpm dev:app   InReach App\n- pnpm dev:web   InReach Main Website\n- pnpm dev:ui    Storybook for UI elements\n- pnpm dev:all   Run all in parallel`,
	{
		title: 'InReach dev Commands',
		borderStyle: 'double',
		borderColor: 'redBright',
		titleAlignment: 'center',
		width: 50,
		padding: 1,
	}
)

console.log(message)
