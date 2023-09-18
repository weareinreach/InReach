import { type Permission } from '@weareinreach/db/generated/permission'

const locations = {
	createNewLocation: 'createLocation',
	createManyNewLocation: 'createLocation',
	updateLocation: 'editAnyLocation',
} satisfies PermissionDefs

const organizations = {
	createNewOrgQuick: 'createOrg',
	attachOrgAttributes: ['editTeamOrg', 'editAnyOrg', 'editSingleOrg'],
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
	viewUserReviews: ['viewUserReviews'],
	hideUserReview: ['hideUserReview'],
	unHideUserReview: ['showUserReview'],
	deleteUserReview: ['deleteUserReview'],
	undeleteUserReview: ['undeleteUserReview'],
} satisfies PermissionDefs

const system = {
	createPermission: 'adminPermissions',
	getDetails: ['dataPortalBasic'],
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
} satisfies PermissionDefs

export const getPermissions = (procedure: PermissionedProcedure): { hasPerm: Permission | Permission[] } => ({
	hasPerm: permissions[procedure],
})

export type PermissionedProcedure = keyof typeof permissions
type PermissionDefs = Record<string, Permission | Permission[]>
