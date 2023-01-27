import { Prisma } from '@weareinreach/db'

type ConnectUser = {
	connect: Prisma.UserWhereUniqueInput
}
export const connectUser = (id: string): ConnectUser => ({ connect: { id } })
