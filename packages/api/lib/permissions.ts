import { type Permission } from '@weareinreach/db/generated/permission'

/**
 * Define the structure for permission definitions This ensures keys are strings and values are valid Prisma
 * Permissions
 */
type PermissionDefs = Record<string, Permission | Permission[]>

const locations = {
	createNewLocation: 'createLocation',
	createManyNewLocation: 'createLocation',
	updateLocation: 'editAnyLocation',
} satisfies PermissionDefs

const organizations = {
	createNewOrgQuick: 'createOrg',
	attachOrgAttributes: ['editTeamOrg', 'editAnyOrg', 'editSingleOrg'],
	dataPortalManager: 'dataPortalManager',
} satisfies PermissionDefs

const orgEmails = {
	createNewEmail: 'editSingleOrg',
	updateEmail: 'editSingleOrg',
} satisfies PermissionDefs

const orgHours = {
	createNewHours: ['editAnyOrg', 'createOrg'],
	updateHours: 'editSingleOrg',
} satisfies PermissionDefs

const orgPhone = {
	createNewPhone: ['editAnyOrg', 'createOrg'],
	updatePhone: 'editSingleOrg',
} satisfies PermissionDefs

const orgPhoto = {
	createPhoto: ['editAnyOrg', 'createOrg'],
	updatePhoto: 'editSingleOrg',
} satisfies PermissionDefs

const orgService = {
	createOrgService: ['editAnyOrg', 'createOrg'],
	updateOrgService: ['editAnyOrg'],
	attachServiceAttribute: ['editAnyOrg', 'createOrg'],
	attachServiceTags: ['editAnyOrg', 'createOrg'],
	createServiceArea: ['editAnyOrg', 'createOrg'],
	linkServiceEmail: ['editAnyOrg', 'createOrg'],
	linkServicePhone: ['editAnyOrg', 'createOrg'],
	createAccessInstructions: ['editAnyOrg', 'createOrg'],
} satisfies PermissionDefs

const orgSocialMedia = {
	createNewSocial: ['editAnyOrg', 'createOrg'],
	updateSocialMedia: 'editSingleOrg',
} satisfies PermissionDefs

const orgWebsite = {
	createOrgWebsite: ['editAnyOrg', 'createOrg'],
	updateOrgWebsite: 'editSingleOrg',
} satisfies PermissionDefs

const reviews = {
	viewUserReviews: 'viewUserReviews',
	hideUserReview: 'hideUserReview',
	unHideUserReview: 'showUserReview',
	deleteUserReview: 'deleteUserReview',
	undeleteUserReview: 'undeleteUserReview',
} satisfies PermissionDefs

const system = {
	createPermission: 'adminPermissions',
	getDetails: 'dataPortalBasic',
} satisfies PermissionDefs

const user = {
	// Use existing valid Permission enum values
	viewAllUsers: 'dataPortalManager',
	// If your enum doesn't have 'assignAdminRole', use the role name itself
	// as the permission string, as checkPermissions handles these strings.
	assignAdminRole: 'dataPortalAdmin',
	updateUserRole: 'adminRoles',
} satisfies PermissionDefs

const permissions = {
	...locations,
	...organizations,
	...orgEmails,
	...orgHours,
	...orgPhone,
	...orgPhoto,
	...orgService,
	...orgSocialMedia,
	...orgWebsite,
	...reviews,
	...system,
	...user,
} satisfies PermissionDefs

/**
 * Helper to get permissions for a procedure
 */
export const getPermissions = (procedure: PermissionedProcedure): { hasPerm: Permission | Permission[] } => ({
	hasPerm: permissions[procedure] as Permission | Permission[],
})

/**
 * Exported types for use in tRPC Meta
 */
export type PermissionedProcedure = keyof typeof permissions
