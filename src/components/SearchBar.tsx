"use client"

import { useState, useEffect, useRef } from 'react'
import { debounce, isEmpty } from 'lodash'

export default function SearchBar() {
  const [searchText, setSearchText] = useState("")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    debouncedSearch(event.target.value)
  }

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (isEmpty(query)) return

      // search spotify here  
      const req = await fetch('/api/spotify/search', { method: 'POST', body: JSON.stringify({ query }) })
      const res = await req.json()
      console.log({res})
      console.log(`debounced search for ${query}`)
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <div className="">
      <form onSubmit={e => {}} className="flex flex-col space-y-5">
        <input 
          className="rounded h-8 p-2 shadow-sm dark:text-black"
          type="text" 
          value={searchText} 
          onChange={e => handleChange(e)} 
          placeholder="- … -"
        />
      </form>
    </div>
  )
}