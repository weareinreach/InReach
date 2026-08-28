import classes from './shared.module.css'

export const sharedBadgeClasses = {
	leader: { root: classes.iconBadgeRoot, label: classes.iconBadgeLabel, section: classes.leaderSection },
	national: { root: classes.iconBadgeRoot, label: classes.iconBadgeLabel, section: classes.nationalSection },
	community: {
		root: classes.communityRoot,
		label: classes.communityLabel,
		section: classes.communitySection,
	},
	privatePractice: {
		root: classes.utilityRoot,
		label: classes.utilityLabel,
		section: classes.utilitySection,
	},
	claimed: { root: classes.utilityRoot, label: classes.utilityLabel, section: classes.utilitySection },
	unclaimed: { root: classes.utilityRoot, label: classes.utilityLabel, section: classes.utilitySection },
	verified: { root: classes.utilityRoot, label: classes.utilityLabel, section: classes.utilitySection },
	verifiedReviewer: {
		root: classes.utilityRoot,
		label: classes.utilityLabel,
		section: classes.utilitySection,
	},
	attribute: { root: classes.utilityRoot, label: classes.utilityLabel, section: classes.utilitySection },
	remote: { root: classes.remoteRoot, section: classes.remoteSection },
} as const

export type SharedBadgeVariant = keyof typeof sharedBadgeClasses
