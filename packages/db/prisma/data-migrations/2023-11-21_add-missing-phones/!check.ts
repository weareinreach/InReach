import { prisma } from '~db/client'

import data from './phone.json'

const run = async () => {
	const phoneIds = new Set<string>()
	const phoneLegacy = new Set<string>()
	const serviceIds = new Set<string>()
	const locationIds = new Set<string>()
	for (const { id, legacyId } of data.orgPhone) {
		phoneIds.add(id)
		phoneLegacy.add(legacyId)
	}
	for (const { serviceId } of data.orgServicePhone) {
		serviceIds.add(serviceId)
	}
	for (const { orgLocationId } of data.orgLocationPhone) {
		locationIds.add(orgLocationId)
	}
	const countPhones = await prisma.orgPhone.count({
		where: { OR: [{ id: { in: [...phoneIds] } }, { legacyId: { in: [...phoneLegacy] } }] },
	})
	const countServices = await prisma.orgService.count({ where: { id: { in: [...serviceIds] } } })
	const countLocations = await prisma.orgLocation.count({ where: { id: { in: [...locationIds] } } })
	console.log('phones', countPhones, phoneIds.size)
	console.log('services', countServices, serviceIds.size)
	console.log('locations', countLocations, locationIds.size)
}
run()
