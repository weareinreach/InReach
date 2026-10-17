import { mergeThemeOverrides, Popover } from '@mantine/core'

import { storybookTheme } from '~ui/theme/storybook'

/**
 * The theme every test's `MantineProvider` should use - `storybookTheme` plus overrides for jsdom's lack of
 * layout.
 *
 * `hideDetached: false`: Popover (and everything built on it - Menu, Select, Combobox, MultiSelect) runs
 * floating-ui's `hide` middleware, which sets `display: none` on the dropdown once it decides the target
 * element is off-screen. jsdom reports a zero-size rect for every element, so that check always says
 * "off-screen" - but it resolves asynchronously, after the dropdown has already rendered visibly. A test that
 * queries the dropdown before that async step finishes passes; one that queries after (under CI load, or
 * after a slow `user.click`) can never find it, no matter how long `findBy` waits.
 *
 * Mantine's own `env="test"` also disables this check, but additionally removes portals and transitions -
 * which would hide the real portal/focus-trap behavior several regression tests here exist to cover (e.g. the
 * Menu-opens-Modal race in `ActionButtons/Group.test.tsx`). This overrides only the one check.
 */
export const testTheme = mergeThemeOverrides(storybookTheme, {
	components: {
		Popover: Popover.extend({ defaultProps: { hideDetached: false } }),
	},
})
