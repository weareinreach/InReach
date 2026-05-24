/**
 * V2 Search Configuration Centralized weights and constants for the search engine.
 */
export const SEARCH_CONFIG = {
	// Exponential weights for Priorities 1-5
	// Ensures Rank 1 is 10x more powerful than Rank 2
	priorityWeights: {
		1: 1000,
		2: 100,
		3: 10,
		4: 5,
		5: 1,
	},
	distanceDecayDampener: 1000.0, // Used in the 1/(1+d) function
	verifiedBonus: 500, // Flat boost for vetted orgs
	serviceMatchWeight: 50, // Points per matching service in "Match Any" mode
}
