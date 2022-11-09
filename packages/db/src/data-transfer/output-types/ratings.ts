/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// To parse this data:
//
//   import { Convert } from "./file";
//
//   const ratingsJSONCollection = Convert.toRatingsJSONCollection(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface RatingsJSONCollection {
	_id: ID
	organizationId: string
	__v: number
	created_at: AtedAt
	ratings: Rating[]
	updated_at: AtedAt
	serviceId?: string
}

export interface ID {
	$oid: string
}

export interface AtedAt {
	$date: Date
}

export interface Rating {
	_id: ID
	rating: number
	source: Source
	created_at: AtedAt
	userId?: string
}

export enum Source {
	Catalog = 'catalog',
	Reviewer = 'reviewer',
}
