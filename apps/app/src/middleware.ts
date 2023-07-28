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

	console.log('middleware pathname:', req.nextUrl.pathname)

	if (req.nextUrl.pathname.startsWith('/search') && !req.nextUrl.pathname.startsWith('/search/intl')) {
		const activeCountries = await get<string[]>('activeCountries')
		const searchedCountry = req.nextUrl.pathname.split('/').at(2)
		if (searchedCountry && !activeCountries?.includes(searchedCountry)) {
			console.log('inactive country', searchedCountry)
			const url = req.nextUrl.clone()
			url.searchParams.forEach((_v, k) => url.searchParams.delete(k))
			url.pathname = `/search/intl/${searchedCountry}`
			// url.searchParams.set('country', searchedCountry)
			const redirected = NextResponse.redirect(url)
			if (session) redirected.cookies.set('inreach-session', session.value)

			return redirected
		}
		return res
	} else {
		return res
	}
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon).*)'],
}
