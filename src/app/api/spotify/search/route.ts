import { NextRequest, NextResponse } from 'next/server'
import { isEmpty } from 'lodash'
import Spotify from 'spotify-web-api-node'

const spotify = new Spotify()
spotify.setRefreshToken(process.env.REFRESH_TOKEN as string)
spotify.setClientId(process.env.CLIENT_ID as string)
spotify.setClientSecret(process.env.CLIENT_SECRET as string)

export async function GET(request: NextRequest) {
  const urlParams = new URL(request.url).searchParams
  const query = urlParams.get('q') // TODO: validate query
  if (isEmpty(query)) return NextResponse.json([])

  // TODO: use vercel kv here
  const refreshRequest = await spotify.refreshAccessToken()
  const token = refreshRequest.body['access_token']
  spotify.setAccessToken(token)

  const searchRequest = await spotify.searchTracks(query as string)
  if (searchRequest.statusCode !== 200)
    return NextResponse.json([], { status: 500 })

  const tracks = searchRequest.body.tracks
  return NextResponse.json(tracks)
}
