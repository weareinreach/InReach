import { type UseFormReturnType } from '@mantine/form'
import { createContext } from 'react'

import { type FormSchema } from './schema'

export const FormContext = createContext<UseFormReturnType<FormSchema> | null>(null)
