import { type HTMLProps } from 'react'

import { _Divider } from './Divider'
import { _Sub } from './Sub'

export const Section = ({ children, ...props }: HTMLProps<HTMLDivElement>) => {
	return <div {...props}>{children}</div>
}

Section.Divider = _Divider
Section.Sub = _Sub
