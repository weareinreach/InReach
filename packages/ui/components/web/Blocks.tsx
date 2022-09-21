import { HeroCarousel } from "./";
import React from "react";

export const Blocks = (props) => {
	if (!props.blocks) return null;

	const blocksToRender = props.blocks.map((block, i: number) => {
		console.log("block", block);
		switch (block?.__typename) {
			case "PagesBlocksHeroCarousel":
				return (
					<HeroCarousel
						key={`${block.__typename}-${i}`}
						items={block.HeroCarouselSlide}
					/>
				);
		}
	});

	return <>{blocksToRender}</>;
};
