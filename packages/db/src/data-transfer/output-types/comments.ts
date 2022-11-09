/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// To parse this data:
//
//   import { Convert } from "./file";
//
//   const commentsJSONCollection = Convert.toCommentsJSONCollection(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface CommentsJSONCollection {
	_id: ID
	organizationId: string
	__v: number
	comments: Comment[]
	created_at: AtedAt
	updated_at: AtedAt
	serviceId?: string
}

export interface ID {
	$oid: string
}

export interface Comment {
	_id: ID
	comment: string
	source: Source
	userId: string
	created_at: AtedAt
	isVerified?: boolean
	is_deleted?: boolean
	isUserApproved?: boolean
	isDeleted?: boolean
	userLocation?: string
}

export interface AtedAt {
	$date: Date
}

export enum Source {
	Catalog = 'catalog',
	Reviewer = 'reviewer',
}
