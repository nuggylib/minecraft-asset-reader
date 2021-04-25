import { renderHook } from "@testing-library/react-hooks"
import {
  useMenuOptions,
  OPTION_VALUE,
} from "../../src/services/core/components/hooks/useMenuOptions"
import { RawAssetData } from "../../src/types/cache"

describe(`useMenuOptions Hook tests`, () => {
  it(`returns the expected options when no assets path, raw data, or parsed data is set`, () => {
    const { result } = renderHook(() =>
      useMenuOptions({
        rawAssetsPath: ``,
        rawData: (null as unknown) as RawAssetData,
      })
    )

    const optionCount = result.current.length
    expect(optionCount).toBe(1)
    const option = result.current[0]

    expect(option.label).toBe(`Set assets directory`)
    expect(option.value).toBe(OPTION_VALUE.SET_ASSETS_DIRECTORY)
  })

  it(`returns the expected options when an assets path is set`, () => {
    const { result } = renderHook(() =>
      useMenuOptions({
        rawAssetsPath: `/some/path/to/assets`,
        rawData: (null as unknown) as RawAssetData,
      })
    )

    const optionCount = result.current.length
    expect(optionCount).toBe(1)
    const option = result.current[0]

    expect(option.label).toBe(`Set assets directory`)
    expect(option.value).toBe(OPTION_VALUE.SET_ASSETS_DIRECTORY)
  })
})
