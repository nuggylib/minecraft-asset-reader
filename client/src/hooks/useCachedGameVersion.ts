import { useEffect, useState } from "react"
import axios from "axios"
import { ContentMap } from "../types"

export const useCachedGameVersion = () => {
  const [gameVersion, setGameVersion] = useState({} as ContentMap)

  useEffect(() => {
    axios.get(`http://localhost:3000/session/game-version`).then((res) => {
      setGameVersion(res.data)
    })
  }, [])

  return gameVersion
}
