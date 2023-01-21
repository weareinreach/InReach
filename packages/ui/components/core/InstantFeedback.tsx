import { Group, Notification, Text, createStyles } from "@mantine/core";
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'


const useStyles = createStyles((theme)=>({
    icon:{
        height:"18.75px",
        width:"21.07px",
    },
    notification:{
        backgroundColor:"#2C2E33",
        width:"335px",
        height:"48px"
    },
    resourceText:{
        color:"white",
        fontSize:"16px",
        fontWeight:theme.other.fontWeight.semibold
    },
    viewList:{
        color:"#79ADD7",
        fontSize:"16px",
        fontWeight:theme.other.fontWeight.semibold
    }
}))

export const InstantFeedback = ({link}:Props) => {
    const { classes } = useStyles()
    const { t } = useTranslation()

    const icon = (<Icon icon="mdi:cards-heart" className={classes.icon}/>)

    return(
        <Notification icon={icon} color="dark" radius="lg" className={classes.notification}>
            <Group position="apart" spacing="lg">
                <Text className={classes.resourceText}>{t('resource-saved')}</Text>
                <Text component="a" href={link} className={classes.viewList}>{t('view-list')}</Text>
            </Group>
        </Notification>
    )
}

type Props = {
    link: string
}