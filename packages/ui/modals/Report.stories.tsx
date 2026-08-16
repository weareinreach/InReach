import { type Meta, type StoryObj } from '@storybook/nextjs'

import { ReportModal } from './Report'

const meta: Meta<typeof ReportModal> = {
	title: 'Modals/ReportModal',
	component: ReportModal,
	parameters: {
		layout: 'centered',
	},
}

export default meta

type Story = StoryObj<typeof ReportModal>

export const Organization: Story = {
	args: {
		itemId: 'org_test_123',
		itemName: 'Example Support Organization',
		children: 'Report Organization',
	},
}

export const Service: Story = {
	args: {
		itemId: 'svc_test_456',
		itemName: 'Crisis Intervention Program',
		orgId: 'org_test_123',
		orgName: 'Example Support Organization',
		serviceId: 'svc_test_456',
		serviceName: 'Crisis Intervention Program',
		children: 'Report Service',
	},
}
