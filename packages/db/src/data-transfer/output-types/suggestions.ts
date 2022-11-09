/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// To parse this data:
//
//   import { Convert } from "./file";
//
//   const suggestionsJSONCollection = Convert.toSuggestionsJSONCollection(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SuggestionsJSONCollection {
	_id: ID
	organizationId: string
	userEmail: string
	field: string
	value: string
	created_at: AtedAt
	updated_at: AtedAt
	__v: number
}

export interface ID {
	$oid: string
}

export interface AtedAt {
	$date: Date
}
