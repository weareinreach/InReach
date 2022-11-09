/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// To parse this data:
//
//   import { Convert } from "./file";
//
//   const reviewsJSONCollection = Convert.toReviewsJSONCollection(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ReviewsJSONCollection {
	_id: ID
	negativeReasons: string[]
	source: Source
	created_at: AtedAt
	updated_at: AtedAt
	__v: number
	comment?: string
	hasAccount?: boolean
	hasLeftFeedbackBefore?: boolean
	rating?: number
}

export interface ID {
	$oid: string
}

export interface AtedAt {
	$date: Date
}

export enum Source {
	Catalog = 'catalog',
	ControlPanel = 'control-panel',
}
