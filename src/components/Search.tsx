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
import { artists } from '@/lib/utils'

export default function Search() {
  const [value, setValue] = useState("")
  const [query, setQuery] = useState("")

  const useSpotifySearch = (query: string) => {
    //@ts-ignore
    const fetcher = (...args) => fetch(...args).then(res => res.json())
    const { data, error, isLoading } = useSWR(`/api/spotify/search?q=${new URLSearchParams(query)}`, fetcher)
   
    return {
      data,
      isLoading,
      error
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
    <Command loop className="rounded-lg border shadow-md max-w-xs" shouldFilter={false}>
      <CommandInput placeholder="Search tracks..." value={value} onValueChange={handleChange} />
      <CommandList>
        {!isEmpty(value) && isLoading && (
          <CommandGroup heading="Search Results">
            <CommandItem>Loading..</CommandItem>
          </CommandGroup>
        )}
        {!isEmpty(value) && data?.items?.length > 0 && (
          <CommandGroup heading="Search Results">
            {data.items.map((track: SpotifyTrack) => (
              <CommandItem key={track.id} value={track.id}>{track.name} — {artists(track.artists)}</CommandItem> 
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}