import { Carousel } from "@inreach/ui/mantine/carousel";
import { LinkButton } from "./";
import {
  createStyles,
  Overlay,
  useMantineTheme,
} from "@inreach/ui/mantine/core";
import Image from "next/future/image";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { PagesBlocksHeroCarouselHeroCarouselSlide } from "../../../.tina/__generated__/types";

interface HeroCarouselProps {
  items: Array<PagesBlocksHeroCarouselHeroCarouselSlide>;
}

const useStyles = createStyles((theme) => ({
  backgroundImg: {
    zIndex: -10,
    objectFit: "cover",
  },
  text: {
    color: theme.colors.white,
  },
}));

export const HeroCarousel = (props: HeroCarouselProps) => {
  const { items } = props;
  const { classes } = useStyles();
  const theme = useMantineTheme();

  const components = {
    LinkButton: LinkButton,
  };
  console.log("hc", items);

  const slides = items.map((slide) => {
    const { image, alt, content } = slide;

    return (
      <Carousel.Slide className={classes.text}>
        <Image
          src={image as string}
          alt={alt as string}
          className={classes.backgroundImg}
          fill
          priority
        />
        <Overlay opacity={0.6} zIndex={-9} color={theme.colors.gray[0]} />
        <TinaMarkdown content={content} components={components} />
      </Carousel.Slide>
    );
  });

  return (
    <Carousel align="center" withControls={false}>
      {slides}
    </Carousel>
  );
};
