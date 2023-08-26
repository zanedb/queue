import NowPlaying from "@/components/NowPlaying";
import Search from "@/components/Search";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main className="bg-gray">
      <div className="mt-8 flex flex-col items-center">
        <div>
          <h1 className="mb-4 text-lg font-semibold">Add to Queue</h1>
        </div>
        <NowPlaying id={params.id} />
        <Search id={params.id} />
      </div>
    </main>
  )
}