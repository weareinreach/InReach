import { Prisma } from '~db/index'

type PermissionDef = Prisma.PermissionCreateManyInput[]

/** Basic permissions - for general users */
const basic = [
	{
		name: 'basic',
		description: 'Basic user role',
	},
] satisfies PermissionDef

/** Organization management permissions */
const org = [
	{
		name: 'editSingleOrg',
		description: 'Edit a single organization - used for claimed orgs',
	},
	{
		name: 'createOrg',
		description: 'Create an organization',
	},
	{
		name: 'editTeamOrg',
		description: 'Edit organizations assigned to your team',
	},
	{
		name: 'editAnyOrg',
		description: 'Edit any organization',
	},
	{
		name: 'publishOrg',
		description: 'Publish an organization',
	},
	{
		name: 'unpublishOrg',
		description: 'Remove an organization from public view',
	},
] satisfies PermissionDef

/** Organization Location management permissions */
const orgLocation = [
	{
		name: 'editSingleLocation',
		description: 'Edit a single location - used for claimed orgs',
	},
	{
		name: 'createLocation',
		description: 'Create a location',
	},
	{
		name: 'editTeamLocation',
		description: 'Edit locations assigned to your team',
	},
	{
		name: 'editAnyLocation',
		description: 'Edit any location',
	},
	{
		name: 'publishLocation',
		description: 'Publish a location',
	},
	{
		name: 'unpublishLocation',
		description: 'Remove a location from public view',
	},
] satisfies PermissionDef

/** Organization Service management permissions */
const orgService = [
	{
		name: 'editSingleService',
		description: 'Edit a single service - used for claimed orgs',
	},
	{
		name: 'createService',
		description: 'Create a service',
	},
	{
		name: 'editTeamService',
		description: 'Edit services assigned to your team',
	},
	{
		name: 'editAnyService',
		description: 'Edit any service',
	},
	{
		name: 'publishService',
		description: 'Publish a service',
	},
	{
		name: 'unpublishService',
		description: 'Remove a service from public view',
	},
] satisfies PermissionDef

/** Organization Review management permissions */
const orgReview = [
	{
		name: 'deleteUserReview',
		description: "Delete a user's review",
	},
	{
		name: 'hideUserReview',
		description: "Hide a user's review",
	},
	{
		name: 'showUserReview',
		description: "Show a user's review",
	},
	{
		name: 'viewUserReviews',
		description: "View another user's reviews",
	},
] satisfies PermissionDef

const userManagement = [
	{
		name: 'createBasicUser',
		description: 'Can create basic user account',
	},
	{
		name: 'createLCRUser',
		description: 'Can create Local Community Reviewer account',
	},
	{
		name: 'createStaffUser',
		description: 'Can create staff user account',
	},
	{
		name: 'createManagerUser',
		description: 'Can create Management user account',
	},
] satisfies PermissionDef

/** System administration permissions */
const system = [
	{
		name: 'root',
		description: 'SUPER USER! Highest possible level. USE WITH CAUTION',
	},
	{
		name: 'adminPermissions',
		description: 'Administer Permission definitions',
	},
	{
		name: 'adminRoles',
		description: 'Administer User Role definitions',
	},
	{
		name: 'adminUserTypes',
		description: 'Administer User Type definitions',
	},
	{
		name: 'adminUserEthnicity',
		description: 'Administer User Ethnicity definitions',
	},
	{
		name: 'adminUserImmigration',
		description: 'Administer User Immigration definitions',
	},
	{
		name: 'adminUserSOG',
		description: 'Administer User Sexual Orientation definitions',
	},
	{
		name: 'adminUserCommunity',
		description: 'Administer User Community definitions',
	},
] satisfies PermissionDef

export const permissionData = [
	...basic,
	...org,
	...orgLocation,
	...orgService,
	...orgReview,
	...userManagement,
	...system,
] satisfies PermissionDef
