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
  if (isEmpty(key))
    return NextResponse.json({ error: 'invalid key' }, { status: 401 })

  const accessToken = await kv.hget(key as string, 'accessToken')
  if (accessToken === null)
    return NextResponse.json({ error: 'invalid key' }, { status: 401 })
  spotify.setAccessToken(accessToken as string)

  try {
    const q = await spotify.getMyCurrentPlaybackState()
    return NextResponse.json(q)
  } catch (e: any) {
    // access token expired, attempt to refresh and handle req
    if (e?.body?.error?.message === 'The access token expired') {
      const refreshToken = await kv.hget(key as string, 'refreshToken')
      if (refreshToken === null) return NextResponse.json([], { status: 401 })

      spotify.setRefreshToken(refreshToken as string)
      const refreshRequest = await spotify.refreshAccessToken()
      if (refreshRequest.statusCode !== 200)
        return NextResponse.json([], { status: 401 })

      spotify.setAccessToken(refreshRequest.body.access_token)
      await kv.hset(key as string, {
        refreshToken,
        accessToken: refreshRequest.body.access_token,
      })

      const q = await spotify.getMyCurrentPlaybackState()
      return NextResponse.json(q)
    } else if (e?.statusCode) {
      return NextResponse.json(
        { error: e?.body?.error?.message },
        { status: e.statusCode }
      )
    } else {
      console.log('an unhandled error occurred', { e })
      return NextResponse.json(
        { error: 'internal server error' },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const key = body.key
  if (isEmpty(key))
    return NextResponse.json({ error: 'invalid key' }, { status: 401 })

  const uri = body.uri
  if (isEmpty(uri))
    return NextResponse.json({ error: 'missing uri' }, { status: 400 })

  const accessToken = await kv.hget(key as string, 'accessToken')
  if (accessToken === null)
    return NextResponse.json({ error: 'invalid key' }, { status: 401 })
  spotify.setAccessToken(accessToken as string)

  try {
    await spotify.addToQueue(uri)
    const q = await spotify.getMyCurrentPlaybackState()

    return NextResponse.json(q)
  } catch (e: any) {
    // we don't need to try to refresh the token here since this request will only happen after a GET req
    // so if the token is refreshed there, this should succeed too
    return NextResponse.json({ error: e.body.error }, { status: e.statusCode })
  }
}
