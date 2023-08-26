import { NextRequest, NextResponse } from 'next/server'
import { isEmpty } from 'lodash'
import { kv } from '@vercel/kv'
import Spotify from 'spotify-web-api-node'

const spotify = new Spotify()
spotify.setClientId(process.env.SPOTIFY_CLIENT_ID as string)
spotify.setClientSecret(process.env.SPOTIFY_CLIENT_SECRET as string)

// TODO: make api route to get access token, store client side; perhaps?

export async function POST(request: NextRequest) {
  const body = await request.json()

  const key = body.key
  if (isEmpty(key))
    return NextResponse.json({ error: 'invalid key' }, { status: 401 })

  const uri = body.uri // TODO: validate uri
  if (isEmpty(uri))
    return NextResponse.json({ error: 'missing uri' }, { status: 400 })

  const accessToken = await kv.hget(key as string, 'accessToken')
  spotify.setAccessToken(accessToken as string)

  try {
    await spotify.addToQueue(uri)
    const q = await spotify.getMyCurrentPlaybackState()

    return NextResponse.json(q)
  } catch (e: any) {
    // TODO: try refreshing token first, then if failed return 401
    // maybe make a /refresh route?
    return NextResponse.json({ error: e.body.error }, { status: e.statusCode })
  }
}
