import React from "react"

export const LoadingIndicator = () => {
  const circleCommonClasses = `ellipses-dot`

  return (
    <div className="export-modal-loading-overlay">
      <div className="animated-ellipses-row">
        <div className={`${circleCommonClasses} mr-1 animate-bounce`}></div>
        <div className={`${circleCommonClasses} mr-1 animate-bounce200`}></div>
        <div className={`${circleCommonClasses} animate-bounce400`}></div>
      </div>
    </div>
  )
}
