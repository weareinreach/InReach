import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { StrictMode } from "react";
// import Head from 'next/head'
import { MantineProvider } from "@inreach/ui/mantine/core";
import { ModalsProvider } from "@inreach/ui/mantine/modals";
import { NotificationsProvider } from "@inreach/ui/mantine/notifications";
import { webTheme, webCache } from "@inreach/ui/theme";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<
	P,
	IP
> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

const MyApp = (appProps: AppPropsWithLayout) => {
	const { Component, pageProps, router } = appProps;
	const getLayout = Component.getLayout ?? ((page) => page);
	// console.log(JSON.stringify(router, null, 2));
	if (router.route === "/sanity/[[...sanity]]") {
		return <Component {...pageProps} />;
	}
	return (
		<StrictMode>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={webTheme}
				emotionCache={webCache}
			>
				<NotificationsProvider>
					<ModalsProvider>
						<>{getLayout(<Component {...pageProps} />)}</>
					</ModalsProvider>
				</NotificationsProvider>
			</MantineProvider>
		</StrictMode>
	);
};

export default MyApp;
