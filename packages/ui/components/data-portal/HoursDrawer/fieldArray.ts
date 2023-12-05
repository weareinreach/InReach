import { type Control, useFieldArray } from 'react-hook-form'

export const useDayFieldArray = (control: Control) => {
	return {
		0: useFieldArray({ control, name: 'create.0' }),
		1: useFieldArray({ control, name: 'create.1' }),
		2: useFieldArray({ control, name: 'create.2' }),
		3: useFieldArray({ control, name: 'create.3' }),
		4: useFieldArray({ control, name: 'create.4' }),
		5: useFieldArray({ control, name: 'create.5' }),
		6: useFieldArray({ control, name: 'create.6' }),
	}
}
