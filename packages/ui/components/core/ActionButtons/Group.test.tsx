import { Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import userEvent from '@testing-library/user-event'
import { forwardRef } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { render, screen, waitFor } from '~ui/test/test-utils'

import { ActionButtonGroup } from './Group'

/**
 * Regression coverage for #2095: `OverflowMenu` used to render whatever action button overflowed
 * (Review/Report/Save) as the literal children of a `Menu.Item` - an interactive element (the action's own
 * trigger button) nested inside another (the Menu.Item). That raced Mantine's Menu's close-on-item-click
 * handling against the newly-opened Modal's focus trap and left the Modal completely unresponsive - the same
 * root cause `ContactInfo/PhoneNumbers.tsx` had already hit and fixed for its own "Create new" trigger (see
 * #2094).
 *
 * Tests the shared `ActionButtonGroup`/`OverflowMenu` mechanism directly with a minimal stand-in action
 * button, rather than dragging in Review/Report/Save's real session/query dependencies - this is a structural
 * bug in the shared overflow-menu plumbing, not in any specific action.
 */

const TestModalButton = forwardRef<HTMLButtonElement, { className?: string; 'data-targetid'?: string }>(
	(props, ref) => {
		const [opened, handler] = useDisclosure(false)
		return (
			<>
				<Modal opened={opened} onClose={handler.close} title='Test Modal'>
					<button type='button' onClick={handler.close}>
						Close Modal
					</button>
				</Modal>
				<button
					type='button'
					ref={ref}
					onClick={handler.open}
					data-targetid={props['data-targetid']}
					className={props.className}
				>
					Open Test Modal
				</button>
			</>
		)
	}
)
TestModalButton.displayName = 'TestModalButton'

describe('ActionButtonGroup + OverflowMenu', () => {
	const originalResizeObserver = window.ResizeObserver

	beforeEach(() => {
		// The global mock in test/setup.ts is a no-op (never invokes its callback), which is right for
		// most tests but means `ActionButtonGroup`'s own width-driven overflow logic never runs -
		// `containerWidth` would stay 0 forever and the overflow menu would never appear. This local
		// override actually invokes the callback with a narrow width, forcing every action into the
		// overflow menu, the same way a real narrow viewport would.
		class NarrowResizeObserver {
			callback: ResizeObserverCallback
			constructor(callback: ResizeObserverCallback) {
				this.callback = callback
			}
			observe = () => {
				const entry = { contentRect: { width: 40 } }
				this.callback([entry as ResizeObserverEntry], this as unknown as ResizeObserver)
			}
			unobserve = () => {}
			disconnect = () => {}
		}
		// The global mock is defined with `writable: true` but not `configurable`, so `vi.stubGlobal`
		// (which redefines the property descriptor) throws - a plain reassignment still works.
		window.ResizeObserver = NarrowResizeObserver as unknown as typeof ResizeObserver
	})
	afterEach(() => {
		window.ResizeObserver = originalResizeObserver
	})

	it('opening a Modal from the overflow menu opens a real, interactive Modal - not a dead one', async () => {
		render(
			<ActionButtonGroup>
				<TestModalButton data-targetid='test-modal' />
			</ActionButtonGroup>
		)
		const user = userEvent.setup()

		// The primary instance is forced invisible (`.inVisible`) by the narrow width, but stays
		// mounted - `getByRole` correctly excludes it (see the accessibility-tree exclusion pattern
		// documented elsewhere in this codebase for `display:none`/`visibility:hidden`), so only the
		// overflow menu's own toggle button is actually reachable here.
		const overflowToggle = screen.getByRole('button', { name: '' })
		await user.click(overflowToggle)

		const menuItem = await screen.findByRole('menuitem', { name: /open test modal/i })
		await user.click(menuItem)

		// The real bug: this heading never appeared at all (or appeared but nothing inside it
		// responded), because the drawer/modal that opened was either the wrong (duplicate, orphaned)
		// instance or never actually interactive.
		await screen.findByRole('heading', { name: 'Test Modal' })
		const closeButton = screen.getByRole('button', { name: /close modal/i })
		await user.click(closeButton)

		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	})
})
