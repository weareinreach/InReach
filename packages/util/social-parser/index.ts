import { PREDEFINED_PROFILES, SocialLinks } from 'social-links'

const socialParser = new SocialLinks()

for (const profile of PREDEFINED_PROFILES) {
	if (profile.name === 'youtube') {
		profile.matches.push(
			{
				match: '(https?://)?(www.)?youtube.com/channel/({PROFILE_ID})(?:/|/.*)?',
				group: 3,
			},
			{
				match: '(https?://)?(www.)?youtube.com/user/({PROFILE_ID})(?:/|/.*)?',
				group: 3,
			}
		)
	}
	socialParser.addProfile(profile.name, profile.matches)
}

export { socialParser }
