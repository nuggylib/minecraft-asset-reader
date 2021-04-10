import { renderHook, act } from "@testing-library/react-hooks"
import { useMenuOptions, OPTION_VALUE } from "../../src/hooks/useMenuOptions"
import { ParsedData, RawAssetData } from "../../src/types"

describe(`useMenuOptions Hook tests`, () => {
  it(`returns the expected options when no assets path, raw data, or parsed data is set`, () => {
    const { result } = renderHook(() =>
      useMenuOptions({
        rawAssetsPath: ``,
        rawData: (null as unknown) as RawAssetData,
        parsedData: (null as unknown) as ParsedData,
      })
    )

    const optionCount = result.current.length
    expect(optionCount).toBe(1)
    const option = result.current[0]

    expect(option.label).toBe(`Set assets directory`)
    expect(option.value).toBe(OPTION_VALUE.SET_ASSETS_DIRECTORY)
  })

  it(`returns the expected options when an assets path is set, but the data has not been bootstrapped (e.g., rawData and parsedData are unset)`, () => {
    const { result } = renderHook(() =>
      useMenuOptions({
        rawAssetsPath: `/some/path/to/assets`,
        rawData: (null as unknown) as RawAssetData,
        parsedData: (null as unknown) as ParsedData,
      })
    )

    const optionCount = result.current.length
    expect(optionCount).toBe(2)

    const expectedOptions = [
      OPTION_VALUE.SET_ASSETS_DIRECTORY,
      OPTION_VALUE.BOOTSTRAP_DATA,
    ]

    result.current.forEach((option) => {
      expect(expectedOptions.includes(option.value)).toBe(true)
    })
  })

  it(`returns the expected options when the assets path, raw data and parsed data are all defined`, () => {
    const { result } = renderHook(() =>
      useMenuOptions({
        rawAssetsPath: `/some/path/to/assets`,
        // The objects for parsed- and rawData don't need to be accurate for this test - they just need to be "defined" (even if just an empty object)
        rawData: {} as RawAssetData,
        parsedData: {} as ParsedData,
      })
    )

    const optionCount = result.current.length
    expect(optionCount).toBe(5)

    const expectedOptions = [
      OPTION_VALUE.SET_ASSETS_DIRECTORY,
      OPTION_VALUE.BOOTSTRAP_DATA,
      OPTION_VALUE.VIEW_RAW_DATA,
      OPTION_VALUE.VIEW_PARSED_DATA,
      OPTION_VALUE.EXPORT_PARSED_DATA,
    ]

    result.current.forEach((option) => {
      expect(expectedOptions.includes(option.value)).toBe(true)
    })
  })
})
