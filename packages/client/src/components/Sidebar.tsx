import React, { useEffect, useState } from "react"
import axios from "axios"
import { useCachedGameVersion } from "../hooks/useCachedGameVersion"
import { Int } from "../types"

export const Sidebar = (props: {
  isOpen: boolean
  toggleSidebarHandler: () => void
  openExportModalHandler: () => void
}) => {
  const [namespaces, setNamespaces] = useState([] as string[])
  const gameVersion = useCachedGameVersion()

  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/persistence/namespace?gameVersion=${gameVersion}`
      )
      .then((response) => {
        if (!!response.data) {
          const cachedNamespaces = response.data.map(
            (queryResult: { id: Int; data: string }) => queryResult.data
          ) as string[]

          setNamespaces((prevState) => [...prevState, ...cachedNamespaces])
        }
      })
    /**
     * N.B.
     *
     * If you tried removing the array entirely, this will trigger an infinite loop - the namespace will be repeatedly rendered since
     * useEffect triggers a state update, which in turn triggers another render cycle (meaning useEffect will naturally be triggered
     * again). Since each render cycle triggers useEffect, and each time useEffect is called, a new render cycle is triggered, the
     * loop will never terminate.
     *
     * By setting passing gameVersion, we make it so that this effect will only run if the game version changes. We do this because,
     * if the game version changed, that means the user changed the root assets path they are working with, which will use an entirely
     * separate database file; the namespaces will not be the same set. By changing with the game version, this ensures the sidebar
     * reflects the database for the version that the user is currently configuring.
     */
  }, [gameVersion])

  return (
    <aside
      className={`sidebar` + (!props.isOpen ? `transform -translate-x-64` : ``)}
    >
      <>
        {!props.isOpen ? null : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="toggle-button h-6 w-6"
              onClick={props.toggleSidebarHandler}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            {/* TODO: Figure out why this text still persists when overflowing - just tired of dealing with UI stuff atm */}
            <h1>Session details</h1>
            <h3>Namespaces</h3>
            {namespaces.map((namespace) => (
              <ul key={`${namespace}_data`}>
                <li>
                  <div className="sidebar-namespace-label">{namespace}</div>
                </li>
                {/* <li>
                  <div className="sidebar-nested-field-label">Blocks:</div>
                  <div className="sidebar-nested-field-value">
                    {Object.keys(cachedContentMap[namespace].blocks).length}
                  </div>
                </li> */}
              </ul>
            ))}
            <button
              className="open-export-modal-button"
              onClick={() => props.openExportModalHandler()}
            >
              Export
            </button>
          </>
        )}
      </>
    </aside>
  )
}
