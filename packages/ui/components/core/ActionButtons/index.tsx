import { Skeleton } from '@mantine/core'

import { ActionButtonGroup } from './Group'
import { OverflowMenu } from './Menu'
import { Print } from './Print'
import { Review } from './Review'
import { Save } from './Save'
import { Share } from './Share'

const Loading = () => <Skeleton h={22} w={70} radius={8} />
export const ActionButtons = () => null

ActionButtons.Loading = Loading
ActionButtons.Save = Save
ActionButtons.Share = Share
ActionButtons.Print = Print
ActionButtons.Review = Review
ActionButtons.Menu = OverflowMenu
ActionButtons.Group = ActionButtonGroup
