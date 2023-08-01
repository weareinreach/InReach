import { type CountryCode } from 'libphonenumber-js'
import { Trans, useTranslation } from 'next-i18next'
import { type LiteralUnion } from 'type-fest'

import { type AccessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { isExternal, Link, type LinkProps } from '~ui/components/core/Link'
import { isCountryCode, parsePhoneNumber } from '~ui/hooks/usePhoneNumber'

const AccessEmail = ({ email, ...props }: EmailProps) => (
	<Link href={`mailto:${email}`} {...props}>
		{email}
	</Link>
)
interface EmailProps extends Omit<LinkProps, 'href'> {
	email: string
}

const AccessLink = ({ link, domainOnly, ...props }: AccessLinkProps) => {
	if (!isExternal(link)) return null
	let displayText: string = ''
	const protocolStrip = /^https?:\/\//i
	// eslint-disable-next-line no-useless-escape
	const domainExtract = /https?:\/\/([^:\/\n?]+)/

	if (domainOnly && typeof link.match(domainExtract)?.at(1) === 'string') {
		const domain = link.match(domainExtract)?.at(1)
		if (domain && typeof domain === 'string') {
			displayText = domain
		}
	} else {
		displayText = link.replace(protocolStrip, '')
	}

	return (
		<Link href={link} {...props}>
			{displayText}
		</Link>
	)
}
interface AccessLinkProps extends Omit<LinkProps, 'href' | 'external'> {
	link: string
	domainOnly?: boolean
}
const AccessPhone = ({ phone, countryCode = 'US', national, ...props }: PhoneProps) => {
	if (!isCountryCode(countryCode)) return null
	const parsedPhone = parsePhoneNumber(phone, countryCode)
	const linkHref =
		parsedPhone?.getType() === undefined ? `tel:${parsedPhone?.formatNational()}` : parsedPhone?.getURI()
	if (!parsedPhone || !isExternal(linkHref)) return null
	return (
		<Link href={linkHref} external {...props}>
			{national || parsedPhone.getType() === undefined
				? parsedPhone.formatNational()
				: parsedPhone.formatInternational()}
		</Link>
	)
}
interface PhoneProps extends Omit<LinkProps, 'href'> {
	phone: string
	countryCode?: LiteralUnion<CountryCode, string>
	national?: boolean
}

const AccessSMS = ({ code, body, ...props }: SMSProps) => {
	const { t } = useTranslation('common')
	const smsHref = body ? `sms:${code}?body=${body}` : (`sms:${code}` as const)
	if (!isExternal(smsHref)) return null
	return (
		<Link href={smsHref} {...props}>
			{body ? <Trans t={t} i18nKey='access.sms-with-body' values={{ body, code }} /> : code}
		</Link>
	)
}
interface SMSProps extends Omit<LinkProps, 'href'> {
	code: string
	body?: string | null
}

const AccessWhatsApp = ({ phone, countryCode = 'US', national, ...props }: WhatsAppProps) => {
	if (!isCountryCode(countryCode)) return null
	const parsedPhone = parsePhoneNumber(phone, countryCode)
	const whatsAppNumber = parsedPhone?.format('E.164').replace('+', '')
	const linkHref = `https://wa.me/${whatsAppNumber}`
	if (!parsedPhone || !isExternal(linkHref)) return null
	return (
		<Link href={linkHref} external {...props}>
			{national ? parsedPhone.formatNational() : parsedPhone.formatInternational()}
		</Link>
	)
}
interface WhatsAppProps extends Omit<LinkProps, 'href'> {
	phone: string
	countryCode?: LiteralUnion<CountryCode, string>
	national?: boolean
}

export const AccessInfo = {
	Email: AccessEmail,
	Link: AccessLink,
	Phone: AccessPhone,
	SMS: AccessSMS,
	WhatsApp: AccessWhatsApp,
}
