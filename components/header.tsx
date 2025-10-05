import { auth } from "@/auth"
import { MainNav } from "./main-nav"
import UserButton from "./user-button"

export default async function Header() {
    const session = await auth()
  return (
    <header className="sticky flex justify-center border-b">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <MainNav session={session}/>
        <UserButton />
      </div>
    </header>
  )
}
