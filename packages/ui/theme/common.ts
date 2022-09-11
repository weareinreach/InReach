import type { MantineThemeOverride } from "@mantine/core";
import { Tuple, DefaultMantineColor } from "@mantine/core";

type ExtendedCustomColors = "inReachGreen" | DefaultMantineColor;

declare module "@mantine/core" {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}

export const commonTheme: MantineThemeOverride = {
  colorScheme: "light",
  colors: {
    inReachGreen: [
      "#f2fcf8",
      "#e6f9f0",
      "#bff1db",
      "#99e8c5",
      "#00c56c",
      "#00c56d", // index 5 - Primary color
      "#00b162",
      "#009452",
      "#007641",
      "#006135",
    ],
  },
  primaryColor: "inReachGreen",
  primaryShade: 5,
};
