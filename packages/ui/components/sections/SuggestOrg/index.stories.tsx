import { type Meta, type StoryObj } from '@storybook/nextjs'

import { geo } from '~ui/mockData/geo'
import { organization } from '~ui/mockData/organization'

import { SuggestOrg } from '.'

export default {
	title: 'Sections/Suggest an Organization',
	component: SuggestOrg,

	beforeEach({ msw }) {
		msw.use(
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			organization.suggestionOptions,
			// Keep this for the actual submission
			organization.createNewSuggestion,
			organization.generateSlug,
			organization.getPotentialMatches
		)
	},

	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'gridDouble',
	},

	// None of these stories ever passed authPromptState - it's a required prop, so every story here
	// crashed reading `.overlay` off of undefined. setOverlay is a no-op since these stories don't
	// need to observe the overlay's own open/close behavior.
	args: {
		authPromptState: {
			overlay: false,
			setOverlay: () => {},
			hasAuth: true,
		},
	},
} satisfies Meta<typeof SuggestOrg>

type StoryDef = StoryObj<typeof SuggestOrg>

export const Desktop = {} satisfies StoryDef

// Type any website containing "example.org" - shows the hard-blocking "duplicate website" message
// and disables submit.
export const DuplicateWebsiteBlocked = {} satisfies StoryDef

// Type "Existing Organization" as the name AND a website containing either "existingorg2.org" (an
// edit-distance typo) or "existingorg.com" (same name, wrong-but-valid TLD) - both shapes show the
// dismissable "Did you mean existingorg.org?" checkbox; submit stays disabled until it's checked.
export const NearMissWebsiteWarning = {} satisfies StoryDef

// Fill out the form with a valid, non-matching website (e.g. https://brandneworg.org) and submit - the
// mutation always rejects with CONFLICT, demonstrating the server-side error alert (e.g. for a
// race-condition duplicate).
export const SubmitConflictError = {
	beforeEach({ msw }) {
		msw.use(
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			organization.suggestionOptions,
			organization.createNewSuggestionConflict,
			organization.generateSlug,
			organization.getPotentialMatches
		)
	},
} satisfies StoryDef
