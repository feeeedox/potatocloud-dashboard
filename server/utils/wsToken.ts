import process from 'node:process'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET,
)

export async function generateWebSocketToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET)
}

export async function verifyWebSocketToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId as string
  }
  catch {
    return null
  }
}
