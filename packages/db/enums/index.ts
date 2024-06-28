export enum AddressVisibility {
	FULL = 'FULL',
	PARTIAL = 'PARTIAL',
	HIDDEN = 'HIDDEN',
}

export enum AttributeRender {
	COMMUNITY = 'COMMUNITY',
	SERVICE = 'SERVICE',
	LEADER = 'LEADER',
	ATTRIBUTE = 'ATTRIBUTE',
	LIST = 'LIST',
}

export enum AttributeAttachment {
	ORGANIZATION = 'ORGANIZATION',
	LOCATION = 'LOCATION',
	SERVICE = 'SERVICE',
	USER = 'USER',
}

export enum FilterType {
	INCLUDE = 'INCLUDE',
	EXCLUDE = 'EXCLUDE',
}

export enum SourceType {
	EXTERNAL = 'EXTERNAL',
	ORGANIZATION = 'ORGANIZATION',
	SYSTEM = 'SYSTEM',
	USER = 'USER',
}

export enum LocationAlertLevel {
	INFO_PRIMARY = 'INFO_PRIMARY',
	WARN_PRIMARY = 'WARN_PRIMARY',
	CRITICAL_PRIMARY = 'CRITICAL_PRIMARY',
	INFO_SECONDARY = 'INFO_SECONDARY',
	WARN_SECONDARY = 'WARN_SECONDARY',
	CRITICAL_SECONDARY = 'CRITICAL_SECONDARY',
}

export enum InterpolationOptions {
	PLURAL = 'PLURAL',
	ORDINAL = 'ORDINAL',
	CONTEXT = 'CONTEXT',
}

export enum VisibilitySetting {
	NONE = 'NONE',
	LOGGED_IN = 'LOGGED_IN',
	PROVIDER = 'PROVIDER',
	PUBLIC = 'PUBLIC',
}

export enum AuditTrailOperation {
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}
