import { useCallback, useRef } from 'react'

/**
 * For a "Create new" action rendered inside a Mantine `Menu.Item` (e.g. a location's "Link or create new..."
 * dropdown, or the toolbar's overflow menu): rendering the real drawer/modal-opening trigger as the
 * `Menu.Item`'s own children nests one interactive element inside another, which races the Menu's
 * close-on-item-click handling against the newly-opened drawer/modal's focus trap and leaves it completely
 * unresponsive - see `ContactInfo/PhoneNumbers.tsx` (the first place this was found and fixed) for the full
 * incident writeup.
 *
 * The fix: render the real trigger hidden, _outside_ the `Menu` entirely, and have the `Menu.Item` just click
 * it by ref. This hook is the small, shared part of that pattern - the ref to attach to the hidden trigger,
 * and the click-proxy handler for the `Menu.Item`'s own `onClick`.
 */
export const useMenuItemCreateTrigger = <T extends HTMLElement = HTMLButtonElement>() => {
	const triggerRef = useRef<T>(null)
	const handleMenuItemClick = useCallback(() => triggerRef.current?.click(), [])
	return { triggerRef, handleMenuItemClick }
}
