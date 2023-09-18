import whyDidYouRender from '@welldone-software/why-did-you-render'
import React from 'react'

// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV === 'development') {
	whyDidYouRender(React)
}
