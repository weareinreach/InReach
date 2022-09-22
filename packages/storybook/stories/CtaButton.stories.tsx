import React from "react";
import { CtaButton } from "@inreach/ui/components/web/sections";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
	title: "Web/Call to Action button",
	component: CtaButton,
	// argTypes: {
	// 	value: {
	// 		name: 'Value from Sanity.io',

	// 	}
	// }
} as ComponentMeta<typeof CtaButton>;

const Template: ComponentStory<typeof CtaButton> = (args) => (
	<CtaButton {...args} />
);

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
	value: { href: "/", title: "Button Text" },
	target: "_blank",
};
