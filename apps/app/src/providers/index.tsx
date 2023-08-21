'use client'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Work_Sans } from 'next/font/google'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

import { EditModeProvider } from '@weareinreach/ui/providers/EditMode'
import { GoogleMapsProvider } from '@weareinreach/ui/providers/GoogleMaps'
import { SearchStateProvider } from '@weareinreach/ui/providers/SearchState'
import { appCache, appTheme } from '@weareinreach/ui/theme'

const fontWorkSans = Work_Sans({ subsets: ['latin'] })

export const Providers = ({ children, session }: ProviderProps) => {
	return (
		<SessionProvider session={session}>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{ ...appTheme, fontFamily: fontWorkSans.style.fontFamily }}
				emotionCache={appCache}
			>
				<ModalsProvider>
					<SearchStateProvider>
						<GoogleMapsProvider>
							<EditModeProvider>{children}</EditModeProvider>
						</GoogleMapsProvider>
					</SearchStateProvider>
				</ModalsProvider>
			</MantineProvider>
		</SessionProvider>
	)
}

type ProviderProps = {
	children: React.ReactNode
	session: Session
}
