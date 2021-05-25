import React from "react"

export const MinecraftAssetReaderContext = /*#__PURE__*/ React.createContext(
  null
)

if (process.env.LOCAL) {
  MinecraftAssetReaderContext.displayName = `minecraftAssetReader`
}

export default MinecraftAssetReaderContext
