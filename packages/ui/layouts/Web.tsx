import {
  ActionIcon,
  AppShell,
  Button,
  createStyles,
  Group,
  Header,
  Title,
  useMantineTheme,
  Menu,
  Center,
} from "@mantine/core";
import { NextLink } from "@mantine/next";
import { Icon } from "@iconify/react";
import Link from "next/link";

type SocialLink = {
  service: string;
  url: string;
  icon: string;
};
type NavLink = {
  label: string;
  link: string;
  links?: NavLink[];
};
type NavData = {
  socialMediaLinks: SocialLink[];
  navLinks: NavLink[];
};
interface LayoutProps {
  children: JSX.Element;
  navData: NavData;
}

const useStyles = createStyles((theme) => ({
  headerTopGroup: {
    backgroundColor: theme.colors.inReachGreen[5],
    button: {
      color: "white",
      borderColor: "white",
    },
  },
  headerButton: {
    backgroundColor: theme.colors.inReachGreen[4],
  },
  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : "black",
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.inReachGreen[5],
    },
  },

  linkLabel: {
    marginRight: 5,
  },
  dropdown: {
    "&:hover": {
      color: theme.colors.white,
      backgroundColor: theme.colors.inReachGreen[5],
    },
  },
  dropdownLink: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : "black",
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    "&:hover": {
      color: theme.colors.white,
    },
  },
}));

const InReachHeader = ({ navData }: { navData: NavData }) => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { socialMediaLinks, navLinks } = navData;

  const socialButtons = socialMediaLinks.map((item, i) => (
    <Link
      href={item.url}
      passHref
      className={classes.headerButton}
      key={`social-${i}`}
    >
      <ActionIcon component="a" title={item.service} variant="transparent">
        <Icon icon={item.icon} height={25} color="white" />
      </ActionIcon>
    </Link>
  ));
  const navMenu = navLinks.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link} className={classes.dropdown}>
        <NextLink href={item.link} className={classes.dropdownLink}>
          {item.label}
        </NextLink>
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" exitTransitionDuration={0}>
          <Menu.Target>
            <NextLink href={link.link} passHref className={classes.link}>
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <Icon icon="tabler:chevron-down" height={12} />
              </Center>
            </NextLink>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <NextLink href={link.link} key={link.label} className={classes.link}>
        {link.label}
      </NextLink>
    );
  });

  return (
    <Header height={215}>
      <Group className={classes.headerTopGroup}>
        <Group>
          <Title order={1} color="white" size="h5" transform="uppercase">
            Seek LGBTQ+ resources. Reach safety. Find belonging.
          </Title>
        </Group>
        <Group>
          <Button uppercase variant="outline" className={classes.headerButton}>
            Find safe resources
          </Button>
          <Button uppercase className={classes.headerButton}>
            Get mobile app
          </Button>
        </Group>
        <Group>{socialButtons}</Group>
      </Group>
      <Group>{navMenu}</Group>
    </Header>
  );
};

export const WebLayout = ({ children, navData }: LayoutProps) => {
  return (
    <AppShell header={<InReachHeader navData={navData} />} fixed={false}>
      {children}
    </AppShell>
  );
};
