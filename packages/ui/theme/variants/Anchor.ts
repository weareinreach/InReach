import classes from '../components/Anchor.module.css'

export const Anchor: Record<string, Partial<Record<'root', string>>> = {
	inline: { root: classes.inline },
	inlineUtil1: { root: classes.inlineUtil1 },
	inlineUtil1darkGray: { root: classes.inlineUtil1DarkGray },
	inlineUtil2darkGray: { root: classes.inlineUtil2DarkGray },
	inlineInverted: { root: classes.inlineInverted },
	inlineInvertedUtil1: { root: classes.inlineInvertedUtil1 },
	inlineInvertedUtil2: { root: classes.inlineInvertedUtil2 },
	inheritStyle: { root: classes.inheritStyle },
	block: { root: classes.block },
	card: { root: classes.card },
	pagination: { root: classes.pagination },
	navMenu: { root: classes.navMenu },
}
