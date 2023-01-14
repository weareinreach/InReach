import husky from 'husky'

var isCi = process.env.CI !== undefined
if (!isCi) {
	husky.install()
}
