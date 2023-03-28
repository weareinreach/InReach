import { type ButtonProps, createPolymorphicComponent } from '@mantine/core'
import { forwardRef, useState } from 'react'

export const UserSurveyModalBody = forwardRef<HTMLButtonElement, UserSurveyModalBodyProps>((props, ref) => {
	return <div>placeholder</div>
})

UserSurveyModalBody.displayName = 'UserSurveyModal'

export const UserSurveyModalLauncher = createPolymorphicComponent<'button', UserSurveyModalBodyProps>(
	UserSurveyModalBody
)

export interface UserSurveyModalBodyProps extends ButtonProps {}

type UserSurveyFormProps = {
	email: string
	password: string
}
