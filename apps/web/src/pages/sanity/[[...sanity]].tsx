import { NextStudio, useConfigWithBasePath } from 'next-sanity/studio'

import type { GetServerSideProps } from 'next'

import config from '../../../sanity/sanity.config'

const StudioPage = () => {
	// return <NextStudio config={useConfigWithBasePath(config)} />;
	return <NextStudio config={config} />
}

export default StudioPage
