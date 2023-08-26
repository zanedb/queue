import { NextRequest, NextResponse } from 'next/server'
import { isEmpty } from 'lodash'
import { kv } from '@vercel/kv'
import Spotify from 'spotify-web-api-node'

const spotify = new Spotify()
spotify.setClientId(process.env.SPOTIFY_CLIENT_ID as string)
spotify.setClientSecret(process.env.SPOTIFY_CLIENT_SECRET as string)

export async function GET(request: NextRequest) {
  const urlParams = new URL(request.url).searchParams

  const key = urlParams.get('key')
  if (isEmpty(key)) return NextResponse.json([], { status: 401 })

  const query = urlParams.get('q') // TODO: validate query
  if (isEmpty(query)) return NextResponse.json([])

  const accessToken = await kv.hget(key as string, 'accessToken')
  if (accessToken === null) return NextResponse.json([], { status: 401 })
  spotify.setAccessToken(accessToken as string)

  const searchRequest = await spotify.searchTracks(query as string)

  if (searchRequest.statusCode !== 200)
    return NextResponse.json([], { status: 500 })

  const tracks = searchRequest.body.tracks
  return NextResponse.json(tracks)
}
