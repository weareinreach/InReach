/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	type Listr,
	type ListrDefaultRenderer,
	type ListrTask as ListrTaskObj,
	type ListrTaskWrapper,
} from 'listr2'

//#region Listr
export type Context = {
	error?: boolean
}
export type PassedTask = ListrTaskWrapper<Context, ListrDefaultRenderer>
export type ListrJob = ListrTaskObj<Context, ListrDefaultRenderer>
export type ListrTask = (
	ctx: Context,
	task: PassedTask
) => void | Promise<void | Listr<Context, any, any>> | Listr<Context, any, any>
//#endregion
