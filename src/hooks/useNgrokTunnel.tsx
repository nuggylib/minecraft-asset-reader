import { useState, useEffect } from "react"
import { AuthServer } from "../server/authServer"

// TODO: This seems fishy - investigate this later (specifically the auth server stuff)
/**
 * Custom hook to get the ngrok tunnel
 *
 * @see https://reactjs.org/docs/hooks-custom.html#extracting-a-custom-hook
 */
export function useNgrokTunnel() {
  const [authServer, setAuthServer] = useState(new AuthServer())
  let [isRunning, setIsRunning] = useState(false)
  let [ngrokUrl, setNgrokUrl] = useState(``)

  useEffect(() => {
    if (!!isRunning) {
      return
    }
    setIsRunning(true)
    function setNgrokUrlHandler(url: string) {
      setNgrokUrl(url)
    }
    authServer.initTunnel(setNgrokUrlHandler)
  })

  return ngrokUrl
}
