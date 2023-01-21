import { Icon } from '@iconify/react'
import { Stack, Text, Group, createStyles, Avatar } from '@mantine/core'
import { DateTime } from 'luxon'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// corresponds the the stack container width 861px
const CHARACTER_LIMIT = 107  

const useStyles = createStyles((theme) => ({

    icon: {
        color: "#00D56C"
    },
    stackContainer: {
        width: '861px'
    },
    stackText: {},
    textReview: {
        fontWeight: theme.other.fontWeight.regular,
        fontSize: '16px',
    },
    textUserName: {
        fontWeight: theme.other.fontWeight.semibold,
        fontSize: '16px'
    },
    textSubText: {
        fontWeight: theme.other.fontWeight.regular,
        fontSize: '16px'
    },
    textShowMore: {
        fontWeight: theme.other.fontWeight.semibold,
    },
    avatar: {
        height: '48px',
        width: '48px'
    }

}))

export const UserReview = ({ user, reviewText, verifiedUser }: Props) => {
    const { classes } = useStyles()
    const { t, i18n } = useTranslation()
    const [showMore, setShowMore] = useState(true);


    let lineClamp = showMore ? 1 : "";
    let showMoreText = showMore ? t('show-more') : t('show-less')
    let showShowMore = reviewText.length > CHARACTER_LIMIT


    const dateString = DateTime.now()
        .setLocale(i18n.resolvedLanguage)
        .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
    const subtextValue = t('in-reach-avatar-date', { dateString })

    return (
        <Stack className={classes.stackContainer}>
            <Group>
                <Avatar radius="xl" className={classes.avatar}>
                    {user?.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            height={24}
                            width={24}
                            alt={user.avatarName || t('user-avatar')}
                        />
                    ) : (
                        <Icon icon='fa6-solid:user' className={classes.avatar} />
                    )}
                </Avatar>
                <Stack align='flex-start' justify='center' spacing={4} className={classes.stackText}>
                    <Text className={classes.textUserName}>{user.avatarName ? user.avatarName : t('in-reach-user')}</Text>
                    <Text className={classes.textSubText}>{subtextValue}</Text>
                </Stack>
            </Group>
            <Text lineClamp={lineClamp} className={classes.textReview}>"{reviewText}"</Text>
            {showShowMore ? (<Text td="underline" className={classes.textShowMore} onClick={() => { setShowMore(!showMore) }}>{showMoreText}</Text>) : (<></>)}
            {verifiedUser ? (<Group>
                <Icon icon="material-symbols:check-circle-rounded" className={classes.icon}></Icon>
                <Text>{t('in-reach-verified-reviewer')}</Text>
            </Group>) : (<></>)}
        </Stack>
    )

}

type Props = {
    user: UserProps
    reviewText: string,
    verifiedUser: boolean
}

type UserProps = {
    avatarUrl: string | null
    avatarName: string | null
}