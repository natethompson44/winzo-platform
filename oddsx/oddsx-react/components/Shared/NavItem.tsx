"use client"
import { naviTemData } from '@/public/data/navData'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import NoPrefetchLink from './NoPrefetchLink'

interface NavItemSingleProps {
    href: string;
    linkText: string;
}

interface NavItemProps {
    navItemSingle: NavItemSingleProps;
}

export default function NavItem({ navItemSingle }: NavItemProps) {
    const path = usePathname()
    return (
        <li>
            <NoPrefetchLink className={`navunik ${path == navItemSingle.href && 'active'}`} href={navItemSingle.href}>{navItemSingle.linkText}</NoPrefetchLink>
        </li>
    )
}
