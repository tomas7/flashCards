"use client"

import Image from "next/image"

import { cn } from "@/lib/utils"
import CustomLink from "./custom-link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu"
import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { useRouter } from 'next/navigation'
import { Session } from "next-auth"
import { getAwaitingApprovals } from "@/actions/getAwaitingApprovals"
type Props = {
  session: Session | null;
};

export function MainNav({ session }: Props) {

    const [awaitingApprovals, setAwaitingApprovals] = useState<{ id: string, word: string, email: string }[]>([]);
  
    useEffect(() => {
      const fetchCards = async () => {
        if (!session?.user?.email) return;
        const data = await getAwaitingApprovals(session.user.email);
        setAwaitingApprovals(data);
      };
      fetchCards();
    }, [session?.user?.email]);

    const router = useRouter();

  return (
  <div className="flex items-center gap-4">
      <NavigationMenu>
        <NavigationMenuList className="flex gap-x-4">
          <NavigationMenuLink
            asChild
          >
            <button onClick={() => router.back()} className="text-blue-600 hover:underline">
              Back
            </button>
          </NavigationMenuLink>

          <NavigationMenuLink href="/admin">
            Dashboard
          </NavigationMenuLink>
          <NavigationMenuLink href="/awaitingApproval">
              <span>Approvals</span>
                {awaitingApprovals.length > 0 && (
                  <span className="bg-red-600 text-white ml-1 text-xs font-bold px-2 py-0.5 rounded-full">
                    {awaitingApprovals.length}
                  </span>
                )}
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
