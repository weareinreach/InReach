import React from 'react'

import * as SectionComponents from './sections'

const resolveSections = (section) => {
	const Section = SectionComponents[section._type]

	if (Section) return Section
	console.error(`Section not found: ${section}`)
	return null
}

export const RenderSections = (props) => {
	const { sections } = props

	if (!sections) {
		console.error('Missing sections')
		return <>Missing Sections</>
	}

	const sectionsToRender = sections.map((section) => {
		const SectionComponent = resolveSections(section)
		if (!SectionComponent) {
			return <>Missing section: {section._type}</>
		}
		return <SectionComponent {...section} key={section._key} />
	})

	return <>{sectionsToRender}</>
}
