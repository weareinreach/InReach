import type {
  Pages,
  PagesBlocksHeroCarouselHeroCarouselSlide,
} from "../../.tina/__generated__/types";
import { HeroCarousel } from "./cms";
import React from "react";

export const Blocks = (props: Pages) => {
  if (!props.blocks) return null;

  const blocksToRender = props.blocks.map((block, i: number) => {
    console.log("block", block);
    switch (block?.__typename) {
      case "PagesBlocksHeroCarousel":
        return (
          <HeroCarousel
            key={`${block.__typename}-${i}`}
            items={
              block.HeroCarouselSlide as PagesBlocksHeroCarouselHeroCarouselSlide[]
            }
          />
        );
    }
  });

  return <>{blocksToRender}</>;
};
