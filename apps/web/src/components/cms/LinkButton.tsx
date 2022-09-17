import { Button } from "@inreach/ui/mantine/core";
import { NextLink } from "@inreach/ui/mantine/next";

export interface LinkButtonProps {
  text: string;
  href: string;
}

export const LinkButton = (props: LinkButtonProps) => {
  const { href, text } = props;
  return (
    <NextLink href={href}>
      <Button>{text}</Button>
    </NextLink>
  );
};
