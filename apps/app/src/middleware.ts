import { get } from '@vercel/edge-config'
import { type NextMiddleware, type NextRequest, NextResponse } from 'next/server'

export const middleware: NextMiddleware = async (req: NextRequest) => {
	const res = NextResponse.next()

	if (!req.cookies.has('inreach-session')) {
		console.log('setting session')
		res.cookies.set({
			name: 'inreach-session',
			value: crypto.randomUUID(),
			httpOnly: true,
			sameSite: 'lax',
		})
	}
	const session = req.cookies.get('inreach-session') ?? res.cookies.get('inreach-session')
	console.log(session?.value)

	if (req.nextUrl.pathname.startsWith('/search')) {
		const activeCountries = await get<string[]>('activeCountries')
		const searchedCountry = req.nextUrl.pathname.split('/').at(2)
		if (searchedCountry && !activeCountries?.includes(searchedCountry)) {
			console.log('inactive country')
			const redirected = NextResponse.rewrite(`/search?country=${searchedCountry}`)
			if (session) redirected.cookies.set('inreach-session', session.value)

			return redirected
		}
		return res
	} else {
		return res
	}
}

export const config = {
	matcher: ['/search/:path*'],
}
