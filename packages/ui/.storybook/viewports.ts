import { type INITIAL_VIEWPORTS } from '@storybook/addon-viewport'

import { type Viewports } from './types'

type ViewportMap = typeof INITIAL_VIEWPORTS
export interface ViewportConfig {
	viewports?: ViewportMap
	defaultViewport?: Viewports
}

export const viewport: ViewportConfig = {
	viewports: {
		iphonex: {
			name: 'iPhone X',
			styles: { height: '812px', width: '375px' },
			type: 'mobile',
		},
		iphonexsmax: {
			name: 'iPhone XS Max',
			styles: { height: '896px', width: '414px' },
			type: 'mobile',
		},
		iphonese2: {
			name: 'iPhone SE (2nd generation)',
			styles: { height: '667px', width: '375px' },
			type: 'mobile',
		},
		iphone12mini: {
			name: 'iPhone 12 mini',
			styles: { height: '812px', width: '375px' },
			type: 'mobile',
		},
		iphone12: {
			name: 'iPhone 12',
			styles: { height: '844px', width: '390px' },
			type: 'mobile',
		},
		iphone12promax: {
			name: 'iPhone 12 Pro Max',
			styles: { height: '926px', width: '428px' },
			type: 'mobile',
		},
		galaxys9: {
			name: 'Galaxy S9',
			styles: { height: '740px', width: '360px' },
			type: 'mobile',
		},
		nexus6p: {
			name: 'Nexus 6P',
			styles: { height: '732px', width: '412px' },
			type: 'mobile',
		},
		pixel: {
			name: 'Pixel',
			styles: { height: '960px', width: '540px' },
			type: 'mobile',
		},
		pixelxl: {
			name: 'Pixel XL',
			styles: { height: '1280px', width: '720px' },
			type: 'mobile',
		},
		ipad: {
			name: 'iPad',
			styles: { height: '1024px', width: '768px' },
			type: 'tablet',
		},
		ipad10p: {
			name: 'iPad Pro 10.5-in',
			styles: { height: '1112px', width: '834px' },
			type: 'tablet',
		},
		ipad12p: {
			name: 'iPad Pro 12.9-in',
			styles: { height: '1366px', width: '1024px' },
			type: 'tablet',
		},
		desktop1: {
			name: 'Desktop - 1920x1080',
			styles: { width: '1920px', height: '1080px' },
			type: 'desktop',
		},
		desktop2: {
			name: 'Desktop - 1366x768',
			styles: { width: '1366px', height: '768px' },
			type: 'desktop',
		},
		desktop3: {
			name: 'Desktop - 1440x900',
			styles: { width: '1440px', height: '900px' },
			type: 'desktop',
		},
		desktop4: {
			name: 'Desktop - 1280x720',
			styles: { width: '1280px', height: '720px' },
			type: 'desktop',
		},
	},
}
