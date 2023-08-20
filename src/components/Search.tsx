"use client"

import useSWR from 'swr'
import { useState, useEffect, useRef } from 'react'
import { debounce, isEmpty } from 'lodash'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { SpotifyTrack } from '@/lib/types'
import Image from 'next/image'
import { artists } from '@/lib/utils'

export default function Search({ id }: { id: string }) {
  const [value, setValue] = useState("")
  const [query, setQuery] = useState("")

  const useSpotifySearch = (query: string) => {
    //@ts-ignore
    const fetcher = (...args) => fetch(...args).then(res => res.json())
    const { data, error, isLoading } = useSWR(`/api/spotify/search?${new URLSearchParams({ q: query, key: id })}`, fetcher)
   
    return {
      data,
      isLoading,
      error
    }
  }

  const addToQueue = async (track: SpotifyTrack) => {
    const req = await fetch(`/api/spotify/queue`, { method: 'POST', body: JSON.stringify({ uri: track.uri, key: id }) })
    const body = await req.json()

    if(req.status === 200) {
      setQuery('')
    } else if(req.status === 404) {
      console.log(`you need to start playing music on a device first silly`)
    } else {
      console.warn(body.error.message)
    }
  }

  const handleChange = (value: string) => {
    setValue(value)
    debouncedSearch(value)
  }

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (isEmpty(query)) return
      console.log(`searching for ${query}`)
      setQuery(query)
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const { data, isLoading, error } = useSpotifySearch(query)

  return (
    <Command loop className="rounded-lg border shadow-md max-w-xs md:max-w-sm lg:max-w-md" shouldFilter={false}>
      <CommandInput placeholder="Search tracks..." value={value} onValueChange={handleChange} />
      <CommandList>
        {!isEmpty(value) && isLoading && (
          <CommandGroup heading="Search Results">
            <CommandItem>Loading..</CommandItem>{/* TODO: skeleton ui when loading*/}
          </CommandGroup>
        )}
        {!isEmpty(value) && data?.items?.length > 0 && (
          <CommandGroup heading="Search Results">
            {data.items.map((track: SpotifyTrack) => (
              <CommandItem onSelect={() => addToQueue(track)} key={track.id} value={track.id} className="cursor-pointer">
                <TrackRow track={track} />
              </CommandItem> 
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}

export function TrackRow({ track }: {track: SpotifyTrack}) {
  return (
    <>
      <Image src={track.album.images[0].url} width={48} height={48} alt={track.name} className="rounded-sm" />
      <div className="flex flex-col pl-2">
        <h3 className="font-medium line-clamp-1">{track.name}</h3>
        <h4 className="font-xs text-gray-700 line-clamp-1">{artists(track.artists)}</h4>
      </div>
    </>
  )
}