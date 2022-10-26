import {
	author,
	category,
	siteConfig,
	page,
	post,
	navigation,
	route,
	teamBio,
} from "./documents";
import {
	blockContent,
	ctaButton,
	simplePortableText,
	nextLink,
	heroCarouselSlides,
	heroCarousel,
	colorText,
	metaData,
} from "./objects";

export const schemaTypes = [
	post,
	author,
	category,
	ctaButton,
	blockContent,
	nextLink,
	page,
	navigation,
	simplePortableText,
	siteConfig,
	heroCarousel,
	heroCarouselSlides,
	colorText,
	metaData,
	teamBio,
	//to be disabled later
	route,
];

// import * as documents from "./documents";
// import * as objects from "./objects";

// export const schemaTypes = [
// 	...Object.values(documents),
// 	...Object.values(objects),
// ];
