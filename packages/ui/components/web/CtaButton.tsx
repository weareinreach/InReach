import { Button } from "@mantine/core";
import { NextLink } from "@mantine/next";

export interface CtaButtonProps {
	text: string;
	href: string;
}

export const CtaButton = (props: CtaButtonProps) => {
	const { href, text } = props;
	return (
		<NextLink href={href}>
			<Button>{text}</Button>
		</NextLink>
	);
};
