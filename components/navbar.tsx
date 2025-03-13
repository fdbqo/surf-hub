"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, WavesIcon as Wave, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"

const surfSpots = [
  { name: "Strandhill Beach", waveType: "Beach break", season: "Autumn and Winter" },
  { name: "Mullaghmore Head", waveType: "Reef break", season: "Winter" },
  { name: "Easkey Left", waveType: "Point break", season: "Autumn" },
  { name: "Enniscrone Beach", waveType: "Beach break", season: "Summer" },
  { name: "Streedagh Beach", waveType: "Beach break", season: "Spring and Autumn" },
]

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/spots", label: "Surf Spots" },
    { href: "/forum", label: "Forum" },
    { href: "/profile", label: "Profile" },
    { href: "#", label: "Forecast" },
  ]

  const handleNavigation = (href: string) => {
    if (href === "/forum" && status === "unauthenticated") {
      router.push("/login?callbackUrl=/forum")
    } else {
      router.push(href)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex flex-wrap h-16 items-center justify-between gap-4 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="flex items-center space-x-2">
                <Wave className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">SligoSurf</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Separator className="my-2" />
              {session ? (
                <>
                  <span className="text-sm text-foreground/60 px-4">Hello, {session.user?.username}</span>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 ml-2">
            <Wave className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SligoSurf</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="text-foreground/60 hover:text-foreground transition-colors"
                onClick={() => handleNavigation(item.href)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-foreground">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search surf spots</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-foreground"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <div className="hidden md:flex items-center space-x-2">
            {status === "authenticated" && session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${session.user.username}.png`}
                        alt={session.user.username}
                      />
                      <AvatarFallback>{session.user.username[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                  {session.user.role === "admin" && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Admin</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => router.push("/admin/users")}>Manage Users</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/admin/spots")}>Manage Spots</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/admin/moderation")}>
                            Content Moderation
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mr-2">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search surf spots..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Surf Spots">
            {surfSpots.map((spot) => (
              <CommandItem key={spot.name}>
                <Link href={`/spots/${spot.name.toLowerCase().replace(/\s+/g, "-")}`} className="flex flex-col">
                  <span>{spot.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {spot.waveType} - Best in {spot.season}
                  </span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  )
}

