import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/interfaces/user"

interface UserListProps {
  title: string
  users: User[]
  onClose: () => void
}

export function UserList({ title, users, onClose }: UserListProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={user.profilePicture || `https://avatar.vercel.sh/${user.username}.png`}
                  alt={user.name}
                />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <Link href={`/profile/${user.username}`} className="font-semibold hover:underline">
                  {user.name}
                </Link>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              {user.role && user.role !== "user" && (
                <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

