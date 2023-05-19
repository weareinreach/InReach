import { prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

const jobDef: JobDef = {
	jobId: '2023-03-30-addSource',
	title: 'Add source for suggestion form',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	if (await jobPreRunner(jobDef, task)) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}

	const newSource = await prisma.source.upsert({
		where: {
			source: 'suggestion',
		},
		create: {
			source: 'suggestion',
			type: 'USER',
		},
		update: {},
	})

	task.output = `Source upserted: ${newSource.id} - ${newSource.source}`

	await jobPostRunner(jobDef)
}

export const job20220330 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
