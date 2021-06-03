import axios from "axios"
import React, { useState } from "react"
import { EXPORT_LOCATION } from "../constants"
import { LoadingIndicator } from "./shared/LoadingIndicator"

export const ExportConfirmationModal = (props: {
  cancelHandler: () => void
}) => {
  const [exportLocation, setExportLocation] = useState(EXPORT_LOCATION.SANITY)
  const [projectId, setProjectId] = useState(``)
  const [dataset, setDataset] = useState(``)
  const [authToken, setAuthToken] = useState(``)
  const [loading, setLoading] = useState(false)

  const submitHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Start a loading spinner
    switch (exportLocation) {
      // case EXPORT_LOCATION.FILE_SYSTEM: {
      //   axios
      //     .post(`http://localhost:3000/site-data/export`, {
      //       writePath,
      //       blockIconScaleSizes: blockScaleSizes,
      //     })
      //     .then(() => {
      //       setLoading(false) // TODO: May not even need this since we are about to dismiss the modal
      //       props.cancelHandler()
      //     })
      //   break
      // }
      case EXPORT_LOCATION.SANITY: {
        axios
          .post(`http://localhost:3000/site-data/export/sanity`, {
            dataset,
            projectId,
            authToken,
          })
          .then(() => {
            setLoading(false) // TODO: May not even need this since we are about to dismiss the modal
            props.cancelHandler()
          })
      }
    }
  }

  return (
    <>
      <div className="modal-overlay" />
      <div className="export-modal">
        {!!loading ? <LoadingIndicator /> : null}
        <div className="p-4">
          <h1>Export to Sanity</h1>
          <p>
            Provide your Sanity project details to upload your configured data
            to it. To get your auth token, use the Sanity CLI and run{` `}
            <code>sanity debug --secrets</code>.
          </p>
          <form>
            {exportLocation === EXPORT_LOCATION.SANITY ? (
              <div className="flex flex-col">
                <label>
                  Project ID:
                  <input
                    className="export-modal-input"
                    type="input"
                    placeholder="..."
                    onChange={(e) => setProjectId(e.target.value)}
                  />
                </label>
                <label>
                  Dataset:
                  <input
                    className="export-modal-input"
                    type="input"
                    placeholder="..."
                    onChange={(e) => setDataset(e.target.value)}
                  />
                </label>
                <label>
                  Auth token:
                  <input
                    className="export-modal-input"
                    type="input"
                    placeholder="..."
                    onChange={(e) => setAuthToken(e.target.value)}
                  />
                </label>
              </div>
            ) : null}
            <div className="space-x-4">
              <button
                className="export-modal-cancel-button"
                onClick={props.cancelHandler}
              >
                Cancel
              </button>
              <button
                className="export-modal-save-button"
                onClick={submitHandler}
              >
                Submit
              </button>
            </div>
            <br />
          </form>
        </div>
      </div>
    </>
  )
}
