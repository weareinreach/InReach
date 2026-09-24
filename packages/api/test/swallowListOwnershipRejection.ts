/**
 * `checkListOwnership` (lib/checkListOwnership.ts) is called without `await` by several savedLists mutation
 * handlers (see GitHub issue #2074 - shareUrl/unShareUrl don't enforce ownership because of this). Tests that
 * exercise the non-owner path against the real (unmocked) function trigger a real, expected rejection that
 * Node reports as an unhandled rejection regardless of it happening inside a handler under test - left
 * unhandled, that flips the whole process exit code even for files where every assertion passes. This
 * swallows exactly that one expected rejection per file, so a genuinely unexpected unhandled rejection still
 * surfaces instead of being hidden by it.
 */
export const swallowListOwnershipRejection = () => {
	process.on('unhandledRejection', (reason) => {
		if (reason instanceof Error && reason.message === 'List does not belong to user') {
			return
		}
		throw reason
	})
}
