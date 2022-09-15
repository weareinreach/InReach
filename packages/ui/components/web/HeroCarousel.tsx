import { Carousel } from "@mantine/carousel";
import { LinkButton } from "./";
import { BackgroundImage } from "@mantine/core";
import Image from "next/future/image";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import React from "react";

interface HeroCarouselProps {
  item: {
    image: string;
    alt: string;
    content: React.ComponentProps<typeof TinaMarkdown>["content"];
  }[];
}

export const HeroCarousel = (props: HeroCarouselProps) => {
  const { item } = props;
  const components = {
    LinkButton: LinkButton,
  };

  const slides = item.map((slide) => {
    const { image, alt, content } = slide;

    return (
      <Carousel.Slide>
        <BackgroundImage component={Image} src={image} alt={alt} />
        <TinaMarkdown content={content} components={components} />
      </Carousel.Slide>
    );
  });

  return <Carousel align="center" withControls={false}></Carousel>;
};
