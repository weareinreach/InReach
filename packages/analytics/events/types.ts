export type ServiceCategoryToggleAction = 'select' | 'unselect' | 'select_from_partial'

export type ServiceModalOpenedAction = { serviceId: string; serviceName?: string; orgSlug: string }
