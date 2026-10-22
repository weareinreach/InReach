import { Anchor, Group, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { type Route } from 'nextjs-routes'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useSlug } from '~ui/hooks/useSlug'
import { Icon } from '~ui/icon'

/**
 * Shown under an item on a location's edit page when it's the organization's contact info linked to that
 * location (`linkedFromOrg` from each type's forContactInfoEdit), not the location's own. It's one record
 * shown in both places, so it's only changed on the organization's page - here staff can only unlink it from
 * this location. To give the location its own version, unlink it and use "Create new".
 */
export const LinkedFromOrgNote = ({ onUnlink, unlinking }: { onUnlink: () => void; unlinking?: boolean }) => {
	const slug = useSlug()
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const orgEditUrl: Route = { pathname: '/org/[slug]/edit', query: { slug } }

	return (
		<Group gap={8} wrap='wrap'>
			<Tooltip
				label="This is the organization's contact info, linked to this location. It can only be changed on the organization page - a change there shows everywhere it's linked."
				multiline
				w={280}
			>
				<Group gap={4} wrap='nowrap'>
					<Icon icon='carbon:link' height={16} color={theme.other.colors.secondary.darkGray} />
					<Text variant={variants.Text.utility4darkGray}>Linked from organization page</Text>
				</Group>
			</Tooltip>
			<Link href={orgEditUrl} variant={variants.Link.inlineInverted}>
				<Text variant={variants.Text.utility4}>Edit on organization page</Text>
			</Link>
			<Anchor component='button' type='button' onClick={onUnlink} disabled={unlinking} underline='always'>
				<Text variant={variants.Text.utility4}>Unlink from this location</Text>
			</Anchor>
		</Group>
	)
}
