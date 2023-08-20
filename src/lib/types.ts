export interface SpotifyTrack {
  name: string
  id: string
  duration_ms: number
  explicit: boolean
  href: string
  uri: string
  type: string
  album: {
    images: [height: number, width: number, url: string]
    name: string
    release_date: string
  }
  artists: [name: string, uri: string, id: string, href: string]
}
