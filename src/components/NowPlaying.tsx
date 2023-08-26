"use client"

import useSWR from 'swr'
import Image from 'next/image'
import { useState } from 'react'
import { PlayFill, SkipBack, SkipForward } from '@geist-ui/icons'

import { SpotifyTrack } from '@/lib/types'
import { artists } from '@/lib/utils'

export default function NowPlaying({ id }: { id: string }) {
  const useQueue = () => {
    //@ts-ignore
    const fetcher = (...args) => fetch(...args).then(res => res.json())
    const { data, error, isLoading } = useSWR(`/api/spotify/queue?${new URLSearchParams({ key: id })}`, fetcher, { refreshInterval: 5000 })
   
    return {
      data,
      isLoading,
      error
    }
  }

  const { data, isLoading, error } = useQueue()
  const track: SpotifyTrack = data?.body?.item

  return (
    <div className="flex items-center bg-white p-5 rounded-md shadow-lg max-w-xs md:max-w-sm lg:max-w-md mb-4">
      <Image src={track?.album?.images[0]?.url ? track?.album?.images[0]?.url : 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Color_icon_gray_v2.svg/800px-Color_icon_gray_v2.svg.png'} width={72} height={72} alt={track?.name ? track?.name : 'Not Playing'} className="rounded-sm" />
      <div className="flex flex-col pl-4 pr-12">
        <h2 className="text-md font-medium line-clamp-1">{isLoading ? 'Loading…' : (track?.name ? track?.name : 'Not Playing')}</h2>
        <h4 className="text-md text-gray-700 line-clamp-1">{isLoading ? 'James Blake' : (track?.artists ? artists(track.artists) : 'Playboi Carti')}</h4>
      </div>
      <div className="">

      </div>
    </div>
  )
}