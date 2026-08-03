import { type Meta, type StoryObj } from '@storybook/react'

import { geo } from '~ui/mockData/geo'
import { organization } from '~ui/mockData/organization'

import { SuggestOrg } from '.'

export default {
	title: 'Sections/Suggest an Organization',
	component: SuggestOrg,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'gridDouble',
		msw: [
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			organization.suggestionOptions,
			organization.createNewSuggestion, // Keep this for the actual submission
			organization.generateSlug,
			organization.getPotentialMatches,
		],
	},
} satisfies Meta<typeof SuggestOrg>

type StoryDef = StoryObj<typeof SuggestOrg>

export const Desktop = {} satisfies StoryDef

// Type "Existing Organization" as the org name - shows the non-blocking "similar name" warning,
// submit stays enabled.
export const SimilarNameWarning = {} satisfies StoryDef

// Type any website containing "example.org" - shows the hard-blocking "duplicate website" message
// and disables submit.
export const DuplicateWebsiteBlocked = {} satisfies StoryDef

// Type "Existing Organization" as the name AND a website containing "existingorg2.org" (a typo of
// existingorg.org, but still a valid TLD) - shows the dismissable "Did you mean existingorg.org?"
// checkbox; submit stays disabled until it's checked.
export const NearMissWebsiteWarning = {} satisfies StoryDef

// Fill out the form with a valid, non-matching website (e.g. https://brandneworg.org) and submit - the
// mutation always rejects with CONFLICT, demonstrating the server-side error alert (e.g. for a
// race-condition duplicate).
export const SubmitConflictError = {
	parameters: {
		msw: [
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			organization.suggestionOptions,
			organization.createNewSuggestionConflict,
			organization.generateSlug,
			organization.getPotentialMatches,
		],
	},
} satisfies StoryDef
