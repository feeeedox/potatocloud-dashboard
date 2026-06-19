import * as z from 'zod'
import { zApiProperty, zGroupCreateRequest, zGroupUpdateRequest } from '~/client/generated/zod.gen';

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

export const newCreateGroupSchema = zGroupCreateRequest.extend({
  name: z
    .string()
    .regex(/\S/, 'Group name cannot be empty')
    .min(1, 'Group name is required'),

  platform: z
    .string()
    .regex(/\S/, 'Platform cannot be empty')
    .min(1, 'Platform is required'),

  platformVersion: z
    .string()
    .regex(/\S/, 'Platform version cannot be empty')
    .min(1, 'Platform version is required'),

  minServices: z
    .number()
    .int()
    .gte(0, 'Min online count must be at least 0')
    .max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' })
    .default(1),

  maxServices: z
    .number()
    .int()
    .gte(1, 'Max online count must be at least 1')
    .max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' })
    .default(1),

  maxPlayerCount: z
    .number()
    .int()
    .gte(1, 'Max player count must be at least 1')
    .max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' })
    .default(100),

  maxMemory: z
    .number()
    .int()
    .gte(128, 'Max memory must be at least 128 MB')
    .max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' })
    .default(1024),

  fallback: z.boolean().default(false),

  staticServices: z.boolean().default(false),

  useModernVelocityForwarding: z.boolean().default(false),

  startPriority: z
    .number()
    .int()
    .gte(0, 'Start priority must be at least 0')
    .lte(100, 'Start priority cannot exceed 100')
    .default(1),

  startPercentage: z
    .number()
    .int()
    .gte(-1, 'New service percent must be higher than 0 or -1 for unlimited players')
    .lte(100, 'New service percent cannot be more than 100, use -1 for unlimited')
    .default(80),

  javaCommand: z.string().optional(),

  customJvmFlags: z.array(z.string()).optional(),

  properties: z.array(zApiProperty).optional(),

  serviceRangeValid: z.boolean().optional(),
})

export const updateGroupSchema = zGroupUpdateRequest.extend({
  customJvmFlags: z.array(z.string()).optional(),
  maxPlayers: z.number().int().max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' }).min(1, 'Max player count must be at least 1').optional(),
  maxMemory: z.number().int().max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' }).min(128, 'Max memory must be at least 128 MB').optional(),
  minServices: z.number().int().max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' }).gte(0, 'Min online count must be at least 0').optional(),
  maxServices: z.number().int().max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' }).gte(1, 'Max online count must be at least 1').optional(),
  fallback: z.boolean().optional(),
  startPriority: z.number().int().gte(0, 'Start priority must be at least 0').lte(100, 'Start priority cannot exceed 100').optional(),
  startPercentage: z.number().int().gte(-1, 'New service percent must be higher than 0 or -1 for unlimited players').lte(100, 'New service percent cannot be more than 100, use -1 for unlimited').max(2147483647, { message: 'Invalid value: Expected int32 to be <= 2147483647' }).optional(),
  templates: z.array(z.string()).optional(),
  properties: z.array(zApiProperty).optional(),
})
