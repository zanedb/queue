const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = process.env // public
const SCOPE = ['user-read-recently-played', 'user-read-currently-playing', 'user-follow-modify', 'app-remote-control', 'user-top-read', 'user-read-playback-state', 'user-read-playback-position', 'user-modify-playback-state', 'streaming'].join('+')

export default function Home() {
  return (
    <main className="bg-gray">
      <div className="mt-8 flex flex-col items-center">
        <div>
          <h1 className="mb-4 text-lg font-semibold">Queue</h1>
          <h1 className="mb-6 text-lg font-semibold text-center">Host a Queue</h1>        
          <a className="bg-green-500 text-white text-md rounded-lg px-12 py-2 shadow-md" href={`https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${SPOTIFY_REDIRECT_URI}&scope=${SCOPE}`}>Login with Spotify</a>
        </div>
      </div>
    </main>
  )
}
