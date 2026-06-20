declare module '#auth-utils' {
  interface User {
    id: number | string
    username: string
    avatar: string
    isAdmin: boolean
    sessionVersion: number
  }

  interface UserSession {
    loggedInAt: Date
  }

  interface SecureSessionData {
  }
}

export {}
