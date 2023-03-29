import { prisma } from '..'

export const jobPreRunner = async (jobDef: JobDef) => {
	try {
		const exists = await prisma.dataMigration.findUnique({
			where: { jobId: jobDef.jobId },
			select: { id: true },
		})
		if (exists?.id) return false
		await prisma.dataMigration.create({ data: jobDef })
		return true
	} catch (err) {
		return false
	}
}

export interface JobDef {
	jobId: string
	title: string
	description?: string
	createdBy: string
}
