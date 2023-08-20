import { NextRequest, NextResponse } from 'next/server'
import { isEmpty } from 'lodash'
import { kv } from '@vercel/kv'
import Chance from 'chance'
import Spotify from 'spotify-web-api-node'

const spotify = new Spotify()
const chance = new Chance()
spotify.setClientId(process.env.SPOTIFY_CLIENT_ID as string)
spotify.setClientSecret(process.env.SPOTIFY_CLIENT_SECRET as string)
spotify.setRedirectURI(process.env.SPOTIFY_REDIRECT_URI as string)

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const urlParams = url.searchParams

  const code = urlParams.get('code')
  if (isEmpty(code))
    return NextResponse.json({ error: 'invalid code' }, { status: 400 })

  try {
    const tokenRequest = await spotify.authorizationCodeGrant(code as string)
    if (tokenRequest.statusCode !== 200)
      return NextResponse.json(
        { error: 'invalid response' },
        { status: tokenRequest.statusCode }
      )

    spotify.setAccessToken(tokenRequest.body.access_token)
    spotify.followUsers(['x.ane']) // hee hee

    const hash = await storeToken(
      tokenRequest.body.refresh_token,
      tokenRequest.body.access_token
    )

    return NextResponse.redirect(`${url.protocol}//${url.host}/${hash}`)
  } catch (e: any) {
    return NextResponse.json({ error: e.body.error }, { status: e.statusCode })
  }
}

const storeToken = async (refreshToken: string, accessToken: string) => {
  const HASH = chance.hash({ length: 6 })
  await kv.hset(HASH, { refreshToken, accessToken })
  return HASH
}
