import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function artists(artists: any) {
  //@ts-ignore
  const _artists = artists.map(({ name }) => name)
  return (_artists.length > 1 ? _artists.join(', ') : _artists[0])
}