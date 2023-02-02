/* eslint-disable import/no-unused-modules */
import boxen from 'boxen'

const message = boxen(`There have been changes to package dependencies!\n\nRun 'pnpm install' to update.`, {
	title: 'New/Updated Packages',
	borderStyle: 'double',
	borderColor: 'redBright',
	titleAlignment: 'center',
	width: 60,
	padding: 1,
})

console.log(message)
