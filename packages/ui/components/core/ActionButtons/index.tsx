import { Skeleton } from '@mantine/core'

import { Delete } from './Delete'
import { ActionButtonGroup } from './Group'
import { OverflowMenu } from './Menu'
import { Print } from './Print'
import { Review } from './Review'
import { Save } from './Save'
import { Share } from './Share'

const Loading = () => <Skeleton h={22} w={70} radius={8} />
export const ActionButtons = () => null

ActionButtons.Group = ActionButtonGroup

ActionButtons.Delete = Delete
ActionButtons.Loading = Loading
ActionButtons.Menu = OverflowMenu
ActionButtons.Print = Print
ActionButtons.Review = Review
ActionButtons.Save = Save
ActionButtons.Share = Share
