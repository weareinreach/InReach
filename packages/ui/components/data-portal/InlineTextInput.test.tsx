import { Textarea } from '@mantine/core'
import { describe, expect, it } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { InlineTextInput } from './InlineTextInput'

describe('InlineTextInput', () => {
	it('defaults spellCheck to true when the caller does not set it', () => {
		render(<InlineTextInput label='Name' value='Legal Aid Clinic' onChange={() => {}} />)

		expect(screen.getByLabelText('Name')).toHaveAttribute('spellcheck', 'true')
	})

	it('lets a caller explicitly disable spellCheck', () => {
		render(
			<InlineTextInput label='Website' value='https://example.org' onChange={() => {}} spellCheck={false} />
		)

		expect(screen.getByLabelText('Website')).toHaveAttribute('spellcheck', 'false')
	})

	it('still defaults spellCheck to true when swapped to a Textarea via the `component` prop', () => {
		render(
			<InlineTextInput
				component={Textarea}
				label='Description'
				value='Some description text'
				onChange={() => {}}
			/>
		)

		expect(screen.getByLabelText('Description')).toHaveAttribute('spellcheck', 'true')
	})
})
