import React, { useState } from "react"
import { useNamespaces } from "./hooks/useNamespaces"
import { BlockDataConfig } from "./BlockDataConfig"
import { Sidebar } from "./Sidebar"
import { ExportConfirmationModal } from "./ExportConfirmationModal"

export const ConfigContentMap = () => {
  const namespaces = useNamespaces()
  const [selectedNamespace, setSelectedNamespace] = useState(
    (null as unknown) as string
  )
  const [showExportModal, setShowExportModal] = useState(false)
  const [sideBarIsOpen, setSidebarIsOpen] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const inputElement = e.target as HTMLElement // Cast to input type since `value` won't exist on the type without it
    setSelectedNamespace(inputElement.innerText)
  }

  const toggleSidebar = () => {
    setSidebarIsOpen(!sideBarIsOpen)
  }

  return (
    <div className="flex overflow-x-hidden h-screen">
      <Sidebar
        isOpen={sideBarIsOpen}
        toggleSidebarHandler={toggleSidebar}
        openExportModalHandler={() => setShowExportModal(true)}
      />
      {!!showExportModal ? (
        <ExportConfirmationModal
          cancelHandler={() => setShowExportModal(false)}
        />
      ) : null}
      <div className="container flex-1 mx-auto">
        <header>
          <svg
            className="toggle-button h-6 w-6"
            onClick={toggleSidebar}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <h1>Minecraft Asset Reader</h1>
        </header>
        <main className="p-4">
          <div className="m-4 p-2 block text-xl w-full">
            <p>
              Below this section are the detected namespaces we found in your
              mod/modpack's raw data. To configure your content map, select the
              namespace you wish to configure, then start selecting records to
              add to the content map. Once you're ready to save the content map,
              click the "Export Content Map" so that's saved to the generated
              content to be used later when generating the page data (such as
              scaled up assets).
            </p>
          </div>
          <div className="namespace-button-grid">
            {namespaces.length > 0 ? (
              <ul>
                {namespaces.map((namespace) => (
                  <button onClick={handleClick} key={namespace}>
                    <div className="namespace-button">
                      <h3>{namespace}</h3>
                    </div>
                  </button>
                ))}
              </ul>
            ) : null}
          </div>
          <div>
            {!!selectedNamespace ? (
              <BlockDataConfig namespace={selectedNamespace} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
