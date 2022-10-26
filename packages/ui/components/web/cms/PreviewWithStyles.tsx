import { MantineProvider } from "@mantine/core";
import { webTheme, webCache } from "../../../theme";
import { ReactNode } from "react";

interface PreviewProps {
	children: ReactNode;
}

export const PreviewWithStyles: React.FC<PreviewProps> = ({ children }) => {
	return (
		<MantineProvider
			withGlobalStyles
			withNormalizeCSS
			theme={webTheme}
			emotionCache={webCache}
		>
			{children}
		</MantineProvider>
	);
};
