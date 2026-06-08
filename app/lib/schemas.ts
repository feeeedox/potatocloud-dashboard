import * as z from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const userNamePasswordSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^\w+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
  password: z.string().min(6).max(100),
})

export const userNameAvatarSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^\w+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
  avatar: z.string().min(1).max(255),
})

export const userUpdateSchema = z
  .object({
    username: z.string().min(3).max(20),
    avatar: z.string().url().nullable(),
    isAdmin: z.boolean(),
    password: z.string().min(8),
  })
  .partial()

export const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  value: z.string().min(1, 'Property value is required'),
  defaultValue: z.string().min(1, 'Default value is required'),
})

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  platform: z.string().min(1, 'Platform is required'),
  platformVersion: z.string().min(1, 'Platform version is required'),
  minOnlineCount: z
    .number()
    .int()
    .min(0, 'Min online count must be at least 0'),
  maxOnlineCount: z
    .number()
    .int()
    .min(1, 'Max online count must be at least 1'),
  maxPlayerCount: z
    .number()
    .int()
    .min(1, 'Max player count must be at least 1'),
  maxMemory: z.number().int().min(128, 'Max memory must be at least 128 MB'),
  fallback: z.boolean().default(false),
  static: z.boolean().default(false),
  useModernVelocityForwarding: z.boolean().default(false),
  startPriority: z
    .number()
    .int()
    .min(1, 'Start priority must be at least 1')
    .default(1),
  newServicePercent: z
    .number()
    .int()
    .min(
      -1,
      'New service percent must be higher than 0 or -1 for unlimited players',
    )
    .max(
      100,
      'New service percent cannot be more than 100, use -1 for unlimited',
    )
    .default(80),
  // Advanced Settings
  startCommand: z.string().optional(),
  customJvmFlags: z.array(z.string()).optional(),
  properties: z.array(propertySchema).optional(),
})

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  serviceTemplates: z.array(z.string()).optional(),
  platform: z.string().min(1, 'Platform is required'),
  platformVersion: z.string().min(1, 'Platform version is required'),
  minOnlineCount: z
    .number()
    .int()
    .min(0, 'Min online count must be at least 0'),
  maxOnlineCount: z
    .number()
    .int()
    .min(1, 'Max online count must be at least 1'),
  maxPlayerCount: z
    .number()
    .int()
    .min(1, 'Max player count must be at least 1'),
  maxMemory: z.number().int().min(128, 'Max memory must be at least 128 MB'),
  fallback: z.boolean().default(false),
  static: z.boolean().default(false),
  useModernVelocityForwarding: z.boolean().default(false),
  startPriority: z
    .number()
    .int()
    .min(1, 'Start priority must be at least 1')
    .default(1),
  newServicePercent: z
    .number()
    .int()
    .min(
      -1,
      'New service percent must be higher than 0 or -1 for unlimited players',
    )
    .max(
      100,
      'New service percent cannot be more than 100, use -1 for unlimited',
    )
    .default(80),
  // Advanced Settings
  startCommand: z.string().optional(),
  customJvmFlags: z.array(z.string()).optional(),
  properties: z.array(propertySchema).optional(),
})
