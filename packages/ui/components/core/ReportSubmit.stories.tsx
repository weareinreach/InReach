import { type Meta, type StoryObj } from '@storybook/nextjs'

import { ReportSubmit } from './ReportSubmit'

const meta: Meta<typeof ReportSubmit> = {
	title: 'Core/ReportSubmit',
	component: ReportSubmit,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		type: {
			control: 'select',
			options: ['body', 'modal'],
		},
	},
}

export default meta

type Story = StoryObj<typeof ReportSubmit>

export const OrganizationReport: Story = {
	args: {
		itemId: 'org_test_123',
		itemName: 'Example Support Organization',
		type: 'body',
	},
}

export const ServiceReport: Story = {
	args: {
		itemId: 'svc_test_456',
		itemName: 'Crisis Intervention Program',
		orgId: 'org_test_123',
		orgName: 'Example Support Organization',
		serviceId: 'svc_test_456',
		serviceName: 'Crisis Intervention Program',
		type: 'body',
	},
}

export const ModalView: Story = {
	args: {
		itemId: 'org_test_123',
		itemName: 'Example Support Organization',
		type: 'modal',
	},
}
