/**
 * Real `@keyframes` names (see `./animations.css`, imported once globally) - v7 removed Emotion's
 * `keyframes()` helper, which previously generated these names at runtime. `bounce`'s distance is now set via
 * the `--ir-bounce-distance` CSS custom property at the call site instead of being baked into the keyframe.
 */
export const shake = {
	1: 'ir-shake-1',
	2: 'ir-shake-2',
	3: 'ir-shake-3',
	4: 'ir-shake-4',
	5: 'ir-shake-5',
	6: 'ir-shake-6',
	7: 'ir-shake-7',
} as const

export const bounce = () => 'ir-bounce'
