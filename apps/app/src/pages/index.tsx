import type { NextPage } from 'next'
import Head from 'next/head'

import { Button } from '@weareinreach/ui/mantine/core'

const Home: NextPage = () => {
	return (
		<>
			<Head>
				{/* eslint-disable-next-line i18next/no-literal-string */}
				<title>InReach</title>
			</Head>

			<p>Hello world.</p>
			<Button>I am a button</Button>
		</>
	)
}

export default Home
