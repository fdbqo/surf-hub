export interface User {
  id: string
  name: string
  username: string
  email: string
  bio?: string
  profilePicture?: string
  role?: "user" | "admin" | "moderator"
  followers?: string[]
  following?: string[]
  favoriteSpots?: string[]
  popularForums?: string[]
}

