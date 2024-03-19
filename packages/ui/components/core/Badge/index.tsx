import { type BadgeProps, Badge as MantineBadge } from '@mantine/core'

import { _Attribute } from './Attribute'
import { _Claimed } from './Claimed'
import { _Community } from './Community'
import { _BadgeGroup } from './Group'
import { _Leader } from './Leader'
import { _National } from './National'
import { _PrivatePractice } from './PrivatePractice'
import { _Remote } from './Remote'
import { _Service } from './Service'
import { _Verified } from './Verified'
import { _VerifiedReviewer } from './VerifiedReviewer'

export const Badge = (props: BadgeProps) => <MantineBadge {...props} />

Badge.Attribute = _Attribute
Badge.Claimed = _Claimed
Badge.Community = _Community
Badge.Group = _BadgeGroup
Badge.Leader = _Leader
Badge.National = _National
Badge.PrivatePractice = _PrivatePractice
Badge.Remote = _Remote
Badge.Service = _Service
Badge.Verified = _Verified
Badge.VerifiedReviewer = _VerifiedReviewer
