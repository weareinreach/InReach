import { prisma } from '~db/index'
import { type ListrJob, type ListrTask, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-07_update-tag',
	title: 'Update tags',
	createdBy: 'Joe Karow',
}
/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230706 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: async (_ctx, task) => {
		/**
		 * Do not edit this part
		 *
		 * This ensures that jobs are only run once
		 */
		if (await jobPreRunner(jobDef, task)) {
			return task.skip(`${jobDef.jobId} - Migration has already been run.`)
		}
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff

		const tags = [
			{ id: 'svtg_01GW2HHFBN31248B3MH1486GE9', name: 'Abortion providers' },
			{ id: 'svtg_01GW2HHFBNJ01JJT2ZGR52T4CM', name: 'Financial assistance' },
			{ id: 'svtg_01GW2HHFBNE70TNNS3KMKEYG8C', name: 'Lodging assistance' },
			{ id: 'svtg_01GW2HHFBNPM2CZ5S6A5GZ3CWY', name: 'Mail order services' },
			{ id: 'svtg_01GW2HHFBNM7GG79WYXK355RC2', name: 'Mental health support' },
			{ id: 'svtg_01GW2HHFBN1NBS5WWDSNB2D9DA', name: 'Travel assistance' },
			{ id: 'svtg_01GW2HHFBND37W7E730QVADK0B', name: 'Cultural centers' },
			{ id: 'svtg_01GW2HHFBNJ4CGGZATZZS8DZWR', name: 'LGBTQ centers' },
			{ id: 'svtg_01GW2HHFBN7GFWZJSATZDCK7EM', name: 'Immigration sponsorship' },
			{ id: 'svtg_01GW2HHFBN1CFQYR8RPA0KHSV0', name: 'Spiritual support' },
			{ id: 'svtg_01GW2HHFBN4B2F1W8HAWNK1HVS', name: 'Computers and internet' },
			{ id: 'svtg_01GW2HHFBP8GY6D2YJ8N1GYTNH', name: 'Career counseling' },
			{ id: 'svtg_01GW2HHFBPZFZF43FEHPV32JC8', name: 'Educational support for LGBTQ youth' },
			{ id: 'svtg_01GW2HHFBPC0P27MT0WMA3C4QH', name: 'English classes' },
			{ id: 'svtg_01GW2HHFBP9GBJPZMWM9PA5DX0', name: 'Leadership training and professional development' },
			{ id: 'svtg_01GW2HHFBPVH03WA49B1ABGW0F', name: 'Libraries' },
			{ id: 'svtg_01GW2HHFBPBQ7XNCBG5AJF6W0X', name: 'Scholarships' },
			{ id: 'svtg_01GW2HHFBP9CP8V4WGA1QCWVKQ', name: 'Food' },
			{ id: 'svtg_01GW2HHFBPG92H7F9REAG9T2X5', name: 'Drop-in centers for LGBTQ youth' },
			{ id: 'svtg_01GW2HHFBPYW3BJXHHZSM33PMY', name: 'Emergency housing' },
			{ id: 'svtg_01GW2HHFBP3A2B8E5F070E9HR6', name: 'Housing information and referrals' },
			{ id: 'svtg_01GW2HHFBPC9YCGABHSSXEGN82', name: 'Short-term housing' },
			{ id: 'svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE', name: 'Trans housing' },
			{ id: 'svtg_01GW2HHFBQYAZE13SSFJ1WZ7J8', name: 'Clothes' },
			{ id: 'svtg_01GW2HHFBQ817GKC3K6D6JGMVC', name: 'Gender-affirming items' },
			{ id: 'svtg_01GW2HHFBQNARDK4H2W30GC1QR', name: 'Gender-neutral bathrooms' },
			{ id: 'svtg_01GW2HHFBQBV2YXAS0AQAFXY33', name: 'Haircuts and stylists' },
			{ id: 'svtg_01GW2HHFBQ0J8FBM5SECT20H4K', name: 'Hygiene' },
			{ id: 'svtg_01GW2HHFBQSF73S87ZRENXHKQV', name: 'Asylum application' },
			{ id: 'svtg_01GW2HHFBQ4R0QKMB5XKN0VPR3', name: 'Citizenship' },
			{ id: 'svtg_01GW2HHFBQEVJCBZC1KSSEB8WN', name: 'Crime and discrimination' },
			{ id: 'svtg_01GW2HHFBQMRW61WVCRR82EJ55', name: 'Deferred Action for Childhood Arrivals (DACA)' },
			{ id: 'svtg_01GW2HHFBQ053M5632FG5BEHAB', name: 'Deportation or removal' },
			{ id: 'svtg_01GW2HHFBQWFR2KPXH7KPX96BD', name: 'Employment authorization' },
			{ id: 'svtg_01GW2HHFBQF6937029TNRN458W', name: 'Family petitions' },
			{ id: 'svtg_01GW2HHFBQ78QZGW7YAPDZ2YJS', name: 'Immigration detention' },
			{ id: 'svtg_01GW2HHFBRY1NC6GD7XAHG6AR8', name: 'Legal hotlines' },
			{ id: 'svtg_01GW2HHFBRB8R4AQVR2FYE72EC', name: 'Name and gender change' },
			{ id: 'svtg_01GW2HHFBR53GRFZYTNQ8DQ2WF', name: 'Residency' },
			{ id: 'svtg_01GW2HHFBR3T44H6K1BKD38JYT', name: 'Special Immigrant Juvenile Status (SIJS)' },
			{ id: 'svtg_01GW2HHFBR0YA6DR2VTE0KCE9N', name: 'T visa' },
			{ id: 'svtg_01GW2HHFBRYVSPX4GA4RZY0XTA', name: 'U visa' },
			{ id: 'svtg_01GW2HHFBRJER29EH8BK4STRPE', name: 'COVID-19 services' },
			{ id: 'svtg_01GW2HHFBRQ76SJBY7973FZFDC', name: 'Dental care' },
			{ id: 'svtg_01GW2HHFBRPBXSYN12DWNEAJJ7', name: 'HIV and sexual health' },
			{ id: 'svtg_01GW2HHFBRJX151YFSTMPVN7CV', name: 'Medical clinics' },
			{ id: 'svtg_01GW2HHFBRDW97D7E0XAPA2XRN', name: 'OBGYN services' },
			{ id: 'svtg_01GW2HHFBRZB55NNQXGZDZSC8Y', name: 'Physical evaluations for asylum claim' },
			{ id: 'svtg_01GW2HHFBR506BA0ZA7XZWX23Q', name: 'Trans health - gender affirming surgery' },
			{ id: 'svtg_01GW2HHFBSBVW6KJACB43FTFNQ', name: 'Trans health - hormone and surgery letters' },
			{ id: 'svtg_01GW2HHFBSZJ7ZQD3AVMKQK83N', name: 'Trans health - hormone therapy' },
			{ id: 'svtg_01GW2HHFBSG3BES4BKSW269M8K', name: 'Trans health - primary care' },
			{ id: 'svtg_01GW2HHFBS5YQWBD8N2V56X5X0', name: 'Trans health - speech therapy' },
			{ id: 'svtg_01GW2HHFBS2G776ZTE6R3ZCWEF', name: 'BIPOC support groups' },
			{ id: 'svtg_01GW2HHFBSKZHCJT1X2KWXC8HB', name: 'Hotlines' },
			{ id: 'svtg_01GW2HHFBSTS3SZNE3GBAF9N2B', name: 'Private therapy and counseling' },
			{ id: 'svtg_01GW2HHFBS617V01ANP6MXPSSX', name: 'Psychological evaluations for asylum claim' },
			{ id: 'svtg_01GW2HHFBSX65WWRQ3BFXHWCJN', name: 'Substance use' },
			{ id: 'svtg_01GW2HHFBS72MEA9GWN7FWYWQA', name: 'Support for caregivers of trans youth' },
			{ id: 'svtg_01GW2HHFBS16CJP08CPDSNNVBY', name: 'Support for conversion therapy survivors' },
			{ id: 'svtg_01GW2HHFBSTFJC21CK33S54BPZ', name: 'Support groups' },
			{ id: 'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W', name: 'Trans support groups' },
			{ id: 'svtg_01GW2HHFBSYJJ8FRE5QRW4BQVR', name: 'Sports and entertainment' },
			{ id: 'svtg_01GW2HHFBSA32322K840DVFNSW', name: 'General translation and interpretation' },
			{ id: 'svtg_01GW2HHFBTPY48P18NZR9S3DC8', name: 'For healthcare' },
			{ id: 'svtg_01GW2HHFBTRAAMB3K1JQ2V41GH', name: 'For legal services' },
			{ id: 'svtg_01GW2HHFBTM1JSTAQKF8DYS9V5', name: 'Transit passes and discounts' },
			{ id: 'svtg_01GW2HHFBTQ73C86ARY7WV96WB', name: 'Transportation assistance' },
			{ id: 'svtg_01GW2HHFBT91CV2R6WKEX6MYPE', name: 'Mail' },
			{ id: 'svtg_01GW2HHFBN7M36NVSDWR6M9K20', name: 'Reception services' },
			{ id: 'svtg_01GW2HHFBPHEBB94KEDQXEA8AC', name: 'Language classes' },
			{ id: 'svtg_01GW2HHFBPV0NV6R04MR84X9H6', name: 'Food assistance' },
			{ id: 'svtg_01GW2HHFBRSQG19TQ4G5EVP3AQ', name: 'Legal advice' },
			{ id: 'svtg_01GW2HHFBRYMX5EH2J05SREANF', name: 'Refugee claim' },
			{ id: 'svtg_01GW2HHFBRK22BMD8KX9DZ9JA5', name: 'Physical evaluations for refugee claim' },
			{ id: 'svtg_01GW2HHFBR4WXR0SMNAKZAHFGK', name: 'Trans health' },
			{ id: 'svtg_01GW2HHFBS6STMXJT0GK4F4YQS', name: 'Psychological evaluations for refugee claim' },
			{ id: 'svtg_01H273CH9YC9PXQWJ5RV349T2F', name: 'Re-entry services' },
			{ id: 'svtg_01H2738F1W23TZXB23VNPR9JM3', name: 'Community and social groups' },
			{ id: 'svtg_01H273BXC1T475GPEW4TXZ3Z20', name: 'Art, music, and literature' },
		]
		const categories = [{ id: 'svct_01GW2HHEVPE008PHCPNHZDAWMS', name: 'Entertainment and Activities' }]

		const tagUpdates = await prisma.$transaction(
			tags.map(({ id, name }) =>
				prisma.serviceTag.update({ where: { id }, data: { name, key: { update: { text: name } } } })
			)
		)
		task.output = `Tags updated: ${tagUpdates.length}`
		const categoryUpdates = await prisma.$transaction(
			categories.map(({ id, name }) =>
				prisma.serviceCategory.update({
					where: { id },
					data: { category: name, key: { update: { text: name } } },
				})
			)
		)

		task.output = `Categories updated: ${categoryUpdates.length}`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
