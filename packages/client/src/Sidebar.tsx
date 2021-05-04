import React from "react"
import { useContentMap } from "./hooks/useContentMap"

export const Sidebar = (props: {
  isOpen: boolean
  toggleSidebarHandler: () => void
  openExportModalHandler: () => void
}) => {
  // TODO: Fix this so that the user doesn't have to close and reopen the menu to see an up-to-date reflection of the stored data
  const cachedContentMap = useContentMap({
    watch: props.isOpen,
  })

  const namespaces = Object.keys(cachedContentMap)

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
                <li>
                  <div className="sidebar-nested-field-label">Blocks:</div>
                  <div className="sidebar-nested-field-value">
                    {Object.keys(cachedContentMap[namespace].blocks).length}
                  </div>
                </li>
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
