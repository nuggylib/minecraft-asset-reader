import React, { useMemo } from "react"
import PropTypes from "prop-types"
import { MinecraftAssetReaderContext } from "./Context"

function Provider({
  db,
  context,
  children,
}: {
  db: any
  context: any
  children: any
}) {
  const contextValue = useMemo(() => {
    return {
      db,
    }
  }, [db])

  const Context = context || MinecraftAssetReaderContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

if (process.env.LOCAL) {
  Provider.propTypes = {
    db: PropTypes.shape({
      setup: PropTypes.func.isRequired,
      close: PropTypes.func.isRequired,
    }),
    context: PropTypes.object,
    children: PropTypes.any,
  }
}

export default Provider
