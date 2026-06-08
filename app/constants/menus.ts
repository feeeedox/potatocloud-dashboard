import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  {
    heading: 'General',
    items: [
      {
        title: 'Home',
        icon: 'i-lucide-home',
        link: '/',
      },
      {
        title: 'Players',
        icon: 'i-lucide-users',
        link: '/players',
      },
    ],
  },
  {
    heading: 'Cloud Management',
    items: [
      {
        title: 'Groups',
        icon: 'i-lucide-layers',
        link: '/groups',
        new: false,
      },
      {
        title: 'Services',
        icon: 'i-lucide-server',
        link: '/services',
        new: false,
      },
      {
        title: 'Platforms',
        icon: 'i-lucide-box',
        link: '/platforms',
        new: false,
        soon: true,
      },
    ],
  },
  {
    heading: 'Administration',
    items: [
      {
        title: 'Members',
        icon: 'i-lucide-user',
        link: '/admin/members',
        new: false,
      },
    ],
  },
]

export const navMenuBottom: NavMenuItems = [
  {
    title: 'Help & Support',
    icon: 'i-lucide-circle-help',
    link: 'https://github.com/feeeedox/potatocloud-dashboard/issues',
  },
  {
    title: 'Feedback',
    icon: 'i-lucide-send',
    link: 'https://github.com/feeeedox/potatocloud-dashboard/discussions',
  },
]
