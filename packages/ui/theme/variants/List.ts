import classes from '../components/List.module.css'

type ListClassNames = Partial<Record<'root' | 'item' | 'itemIcon' | 'itemWrapper', string>>

/** `inlineUtil2`/`inlineBulletUtil2` were dropped - confirmed zero usage repo-wide. */
export const List: Record<string, ListClassNames> = {
	inline: { root: classes.inline, item: classes.inlineItem, itemIcon: classes.inlineItemIcon },
	inlineBullet: {
		root: classes.inlineBullet,
		item: classes.inlineBulletItem,
		itemIcon: classes.inlineBulletItemIcon,
		itemWrapper: classes.inlineBulletItemWrapper,
	},
	textDarkGray: { item: classes.textDarkGrayItem },
	inlineBulletUtil2DarkGray: {
		root: classes.inlineBulletUtil2DarkGray,
		item: classes.inlineBulletUtil2DarkGrayItem,
		itemIcon: classes.inlineBulletUtil2DarkGrayItemIcon,
		itemWrapper: classes.inlineBulletUtil2DarkGrayItemWrapper,
	},
	inlineUtil2DarkGray: {
		root: classes.inlineUtil2DarkGray,
		item: classes.inlineUtil2DarkGrayItem,
		itemIcon: classes.inlineUtil2DarkGrayItemIcon,
	},
}
