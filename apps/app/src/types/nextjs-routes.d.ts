// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// This file will be automatically regenerated when your Next.js server is running.
// nextjs-routes version: 2.2.2
/* eslint-disable */

// prettier-ignore
declare module "nextjs-routes" {
  import type {
    GetServerSidePropsContext as NextGetServerSidePropsContext,
    GetServerSidePropsResult as NextGetServerSidePropsResult
  } from "next";

  export type Route =
    | StaticRoute<"/">
    | StaticRoute<"/401">
    | StaticRoute<"/403">
    | StaticRoute<"/404">
    | StaticRoute<"/500">
    | StaticRoute<"/account">
    | StaticRoute<"/account/reviews">
    | StaticRoute<"/account/saved">
    | DynamicRoute<"/account/saved/[listId]", { "listId": string }>
    | StaticRoute<"/admin">
    | StaticRoute<"/admin/management">
    | StaticRoute<"/admin/quicklink">
    | StaticRoute<"/admin/quicklink/email">
    | StaticRoute<"/admin/quicklink/phone">
    | StaticRoute<"/admin/quicklink/services">
    | DynamicRoute<"/api/auth/[...nextauth]", { "nextauth": string[] }>
    | StaticRoute<"/api/i18n/load">
    | StaticRoute<"/api/i18n/webhook">
    | StaticRoute<"/api/panel">
    | StaticRoute<"/api/trpc-playground">
    | DynamicRoute<"/api/trpc/[trpc]", { "trpc": string }>
    | DynamicRoute<"/org/[slug]", { "slug": string }>
    | DynamicRoute<"/org/[slug]/[orgLocationId]", { "slug": string; "orgLocationId": string }>
    | DynamicRoute<"/org/[slug]/[orgLocationId]/edit", { "slug": string; "orgLocationId": string }>
    | DynamicRoute<"/org/[slug]/edit", { "slug": string }>
    | DynamicRoute<"/org/[slug]/remote", { "slug": string }>
    | StaticRoute<"/profile">
    | DynamicRoute<"/search/[...params]", { "params": string[] }>
    | StaticRoute<"/search/intl">
    | DynamicRoute<"/search/intl/[country]", { "country": string }>
    | StaticRoute<"/suggest">
    | StaticRoute<"/support">;

  interface StaticRoute<Pathname> {
    pathname: Pathname;
    query?: Query | undefined;
    hash?: string | null | undefined;
  }

  interface DynamicRoute<Pathname, Parameters> {
    pathname: Pathname;
    query: Parameters & Query;
    hash?: string | null | undefined;
  }

  interface Query {
    [key: string]: string | string[] | undefined;
  };

  export type RoutedQuery<P extends Route["pathname"] = Route["pathname"]> = Extract<
    Route,
    { pathname: P }
  >["query"];

  export type Locale = 
    | "en"
    | "es"
    | "fr"
    | "ar"
    | "zh"
    | "ja"
    | "ko"
    | "pl"
    | "pt"
    | "ru"
    | "uk";

  type Brand<K, T> = K & { __brand: T };

  /**
   * A string that is a valid application route.
   */
  export type RouteLiteral = Brand<string, "RouteLiteral">

  /**
   * A typesafe utility function for generating paths in your application.
   *
   * route({ pathname: "/foos/[foo]", query: { foo: "bar" }}) will produce "/foos/bar".
   */
  export declare function route(r: Route): RouteLiteral;

  /**
   * Nearly identical to GetServerSidePropsContext from next, but further narrows
   * types based on nextjs-route's route data.
   */
  export type GetServerSidePropsContext<
    Pathname extends Route["pathname"] = Route["pathname"],
    Preview extends NextGetServerSidePropsContext["previewData"] = NextGetServerSidePropsContext["previewData"]
  > = Omit<NextGetServerSidePropsContext, 'params' | 'query' | 'defaultLocale' | 'locale' | 'locales'> & {
    params: Extract<Route, { pathname: Pathname }>["query"];
    query: Query;
    defaultLocale: "en";
    locale: Locale;
    locales: [
          "en",
          "es",
          "fr",
          "ar",
          "zh",
          "ja",
          "ko",
          "pl",
          "pt",
          "ru",
          "uk"
        ];
  };

  /**
   * Nearly identical to GetServerSideProps from next, but further narrows
   * types based on nextjs-route's route data.
   */
  export type GetServerSideProps<
    Props extends { [key: string]: any } = { [key: string]: any },
    Pathname extends Route["pathname"] = Route["pathname"],
    Preview extends NextGetServerSideProps["previewData"] = NextGetServerSideProps["previewData"]
  > = (
    context: GetServerSidePropsContext<Pathname, Preview>
  ) => Promise<NextGetServerSidePropsResult<Props>>
}

// prettier-ignore
declare module "next/link" {
  import type { Route } from "nextjs-routes";;
  import type { LinkProps as NextLinkProps } from "next/dist/client/link";
  import type React from "react";

  type StaticRoute = Exclude<Route, { query: any }>["pathname"];

  export type LinkProps = Omit<NextLinkProps, "href" | "locale"> & {
    href: Route | StaticRoute | Omit<Route, "pathname">;
    locale?: Locale | false;
  }

  /**
   * A React component that extends the HTML `<a>` element to provide [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)
   * and client-side navigation between routes.
   *
   * It is the primary way to navigate between routes in Next.js.
   *
   * Read more: [Next.js docs: `<Link>`](https://nextjs.org/docs/app/api-reference/components/link)
   */
  declare const Link: React.ForwardRefExoticComponent<Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps & {
      children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>>;
  export default Link;
}

// prettier-ignore
declare module "next/router" {
  import type { Locale, Route, RoutedQuery } from "nextjs-routes";
  import type { NextRouter as Router } from "next/dist/client/router";
  export * from "next/dist/client/router";
  export { default } from "next/dist/client/router";

  type NextTransitionOptions = NonNullable<Parameters<Router["push"]>[2]>;
  type StaticRoute = Exclude<Route, { query: any }>["pathname"];

  interface TransitionOptions extends Omit<NextTransitionOptions, "locale"> {
    locale?: Locale | false;
  }

  type PathnameAndQuery<Pathname> = Required<
    Pick<Extract<Route, { pathname: Pathname }>, "pathname" | "query">
  >;

  type AutomaticStaticOptimizedQuery<PaQ> = Omit<PaQ, "query"> & {
    query: Partial<PaQ["query"]>;
  };

  type BaseRouter<PaQ> =
    | ({ isReady: false } & AutomaticStaticOptimizedQuery<PaQ>)
    | ({ isReady: true } & PaQ);

  export type NextRouter<P extends Route["pathname"] = Route["pathname"]> =
    BaseRouter<PathnameAndQuery<P>> &
      Omit<
        Router,
        | "defaultLocale"
        | "domainLocales"
        | "isReady"
        | "locale"
        | "locales"
        | "pathname"
        | "push"
        | "query"
        | "replace"
        | "route"
      > & {
        defaultLocale: "en";
        domainLocales?: undefined;
        locale: Locale;
        locales: [
          "en",
          "es",
          "fr",
          "ar",
          "zh",
          "ja",
          "ko",
          "pl",
          "pt",
          "ru",
          "uk"
        ];
        push(
          url: Route | StaticRoute | Omit<Route, "pathname">,
          as?: string,
          options?: TransitionOptions
        ): Promise<boolean>;
        replace(
          url: Route | StaticRoute | Omit<Route, "pathname">,
          as?: string,
          options?: TransitionOptions
        ): Promise<boolean>;
        route: P;
      };

  export function useRouter<P extends Route["pathname"]>(): NextRouter<P>;
}
