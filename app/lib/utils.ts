import type { Updater } from '@tanstack/vue-table'
import type { ClassValue } from 'clsx'
import type { Ref } from 'vue'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}

export function formatMillisToTime(millis: number) {
  const startTime = millis
  const now = Date.now()

  const diff = now - startTime
  const absoluteDiff = Math.abs(diff)
  const seconds = Math.floor((absoluteDiff / 1000) % 60)
  const minutes = Math.floor((absoluteDiff / (1000 * 60)) % 60)
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  const parts = []
  if (days > 0)
    parts.push(`${days}d`)
  if (hours > 0)
    parts.push(`${hours}h`)
  if (minutes > 0)
    parts.push(`${minutes}m`)
  if (parts.length === 0)
    parts.push(`${seconds}s`)

  const formattedUptime = parts.join(' ')

  return formattedUptime
}

export function formatSecondsToTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (hours > 0)
    parts.push(`${hours}h`)
  if (minutes > 0)
    parts.push(`${minutes}m`)
  if (parts.length === 0) {
    const roundedSecs = Math.round(secs)
    parts.push(`${roundedSecs}s`)
  }

  return parts.join(' ')
}