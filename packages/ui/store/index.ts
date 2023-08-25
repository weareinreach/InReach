import { create } from 'zustand'

export const useStore = create<Store>((set) => ({
	loading: false,
	setLoading: (loading: boolean) => set(() => ({ loading })),

	canSave: false,
	setCanSave: (canSave: boolean) => set(() => ({ canSave })),
}))

export const useLoading = () => useStore((state) => [state.loading, state.setLoading])
export const useCanSave = () => useStore((state) => [state.canSave, state.setCanSave])

interface Store {
	loading: boolean
	setLoading: (loading: boolean) => void
	canSave: boolean
	setCanSave: (canSave: boolean) => void
}
