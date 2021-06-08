import React, { useEffect, useReducer } from "react"
import { useScaledBlockImages } from "../../hooks/useScaledBlockImages"
import { BlockModelData } from "../../minecraft/types"
import axios from "axios"
import { BlockModalNumberInput } from "./BlockModalNumberInput"
import { useCachedGameVersion } from "../../hooks/useCachedGameVersion"

const NONE = `none`

export enum BLOCK_MODAL_ACTION {
  SET_TITLE = `set_title`,
  SET_TOP = `set_top`,
  SET_LEFT = `set_left`,
  SET_RIGHT = `set_right`,
  SET_DESCRIPTION = `set_description`,
  SET_FLAMMABILITY_ENCOURAGEMENT = `set_flammability_encouragement`,
  SET_FLAMMABILITY = `set_flammability`,
  SET_LIGHT_LEVEL = `set_light_level`,
  SET_MIN_SPAWN = `set_min_spawn`,
  SET_MAX_SPAWN = `set_max_spawn`,
  SET_HARVEST_TOOL = `set_harvest_tool`,
  SET_HARVEST_TOOL_QUALITIES = `set_harvest_tool_qualities`,
  LOAD_CACHED = `load_cached`,
}

const HARVEST_TOOLS = [`axe`, `hoe`, `pickaxe`, `shovel`, `hand`, `none`]

const HARVEST_TOOL_QUALITIES = [
  `wood`,
  `stone`,
  `iron`,
  `diamond`,
  `netherite`,
  `gold`,
  `none`,
]

const RANGES = {
  flammabilityEncouragement: {
    min: 0,
    max: 60,
  },
  flammability: {
    min: 0,
    max: 100,
  },
  lightLevel: {
    min: 0,
    max: 15,
  },
  spawnLevel: {
    min: 0,
    max: 320,
  },
}

/**
 * Most actions are really straightforward The only "complex" case to handle is the `LOAD_CACHED`
 * action, which needs to set all of the cached values simultaenously (which can't be done using
 * `useEffect` due to how React batches state change updates)
 */
const reducer = (prevState: any, action: any) => {
  switch (action.type) {
    case BLOCK_MODAL_ACTION.SET_TITLE: {
      return {
        ...prevState,
        title: action.payload.title,
      }
    }
    case BLOCK_MODAL_ACTION.SET_TOP: {
      return {
        ...prevState,
        top: action.payload.top,
      }
    }
    case BLOCK_MODAL_ACTION.SET_LEFT: {
      return {
        ...prevState,
        left: action.payload.left,
      }
    }
    case BLOCK_MODAL_ACTION.SET_RIGHT: {
      return {
        ...prevState,
        right: action.payload.right,
      }
    }
    case BLOCK_MODAL_ACTION.SET_FLAMMABILITY: {
      return {
        ...prevState,
        flammability: action.payload.flammability,
      }
    }
    case BLOCK_MODAL_ACTION.SET_FLAMMABILITY_ENCOURAGEMENT: {
      return {
        ...prevState,
        flammabilityEncouragement: action.payload.flammabilityEncouragement,
      }
    }
    case BLOCK_MODAL_ACTION.SET_LIGHT_LEVEL: {
      return {
        ...prevState,
        lightLevel: action.payload.lightLevel,
      }
    }
    case BLOCK_MODAL_ACTION.SET_MIN_SPAWN: {
      return {
        ...prevState,
        minSpawn: action.payload.minSpawn,
      }
    }
    case BLOCK_MODAL_ACTION.SET_MAX_SPAWN: {
      return {
        ...prevState,
        maxSpawn: action.payload.maxSpawn,
      }
    }
    case BLOCK_MODAL_ACTION.SET_HARVEST_TOOL: {
      const harvestTool = action.payload.harvestTool
      if (harvestTool === `none` || harvestTool === `hand`) {
        return {
          ...prevState,
          harvestToolQualities: [`none`],
          harvestTool: action.payload.harvestTool,
        }
      } else {
        return {
          ...prevState,
          harvestToolQualities: [],
          harvestTool: action.payload.harvestTool,
        }
      }
    }
    case BLOCK_MODAL_ACTION.SET_HARVEST_TOOL_QUALITIES: {
      return {
        ...prevState,
        harvestToolQualities: action.payload.harvestToolQualities,
      }
    }
    case BLOCK_MODAL_ACTION.LOAD_CACHED: {
      return {
        ...prevState,
        title: action.payload.title,
        top: action.payload.top,
        left: action.payload.left,
        right: action.payload.right,
        flammabilityEncouragement: action.payload.flammabilityEncouragement,
        flammability: action.payload.flammability,
        lightLevel: action.payload.lightLevel,
        minSpawn: action.payload.minSpawn,
        maxSpawn: action.payload.maxSpawn,
        harvestTool: action.payload.harvestTool,
        harvestToolQualities: action.payload.harvestToolQualities,
      }
    }
    default: {
      return {
        ...prevState,
      }
    }
  }
}

export const BlockModal = (props: {
  namespace: string
  blockModelData: {
    block: string
    data: BlockModelData
  }
  dimiss: () => void
}) => {
  const cachedGameVersion = useCachedGameVersion()

  /**
   * All cache-linked state values (which should be all of them in this component)
   * need to be in this reducer. Technically, most cases in the reducer can be handled
   * with a normal "set state" function. However, when this component is loading, *and
   * there is data for this block in the cache*, we need to set ALL of these values at
   * the same time, making useReducer necessary for this component's state management.
   */
  const [modalState, dispatch] = useReducer(reducer, {
    title: ``,
    top: NONE,
    left: NONE,
    right: NONE,
    flammabilityEncouragement: 0,
    flammability: 0,
    lightLevel: 0,
    minSpawn: 0,
    maxSpawn: 0,
    harvestTool: ``,
    harvestToolQualities: [],
  })

  const blockTextures = useScaledBlockImages({
    namespace: props.namespace,
    block: props.blockModelData.block,
    scale: 8,
  })

  const renderDropdownOptions = () =>
    Object.keys(blockTextures).map((textureName) => (
      <option
        key={`${textureName}_opt`}
        value={`${textureName.replace(`blocks/`, ``)}`}
      >
        {textureName.replace(`blocks/`, ``)}
      </option>
    ))

  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/persistence/block?gameVersion=${cachedGameVersion}&namespace=${props.namespace}&q=${props.blockModelData.block}`
      )
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const {
            title,
            icon_side_top,
            icon_side_left,
            icon_side_right,
            flammability_encouragement,
            flammability,
            light_level,
            min_spawn,
            max_spawn,
            harvest_tools,
            harvest_tool_qualities,
          } = res.data[0].data
          console.log(`GOT BLOCK: `, harvest_tools)
          if (title) {
            dispatch({
              type: BLOCK_MODAL_ACTION.LOAD_CACHED,
              payload: {
                title,
                top: icon_side_top,
                left: icon_side_left,
                right: icon_side_right,
                flammabilityEncouragement: flammability_encouragement,
                flammability,
                lightLevel: light_level,
                minSpawn: min_spawn,
                maxSpawn: max_spawn,
                harvestTool:
                  harvest_tools.length > 0 ? harvest_tools[0].data : null,
                harvestToolQualities: harvest_tool_qualities.map(
                  (qObj: { id: string; data: string }) => qObj.data
                ),
              },
            })
          }
        }
      })
  }, [
    modalState.title,
    modalState.top,
    modalState.left,
    modalState.right,
    props.namespace,
    props.blockModelData.block,
    cachedGameVersion,
  ])

  const saveHandler = () => {
    axios
      .post(`http://localhost:3000/persistence/block`, {
        key: props.blockModelData.block,
        namespace: props.namespace,
        gameVersion: cachedGameVersion,
        title: modalState.title,
        iconData: {
          top: `${modalState.top}`,
          sideL: `${modalState.left}`,
          sideR: `${modalState.right}`,
        },
        flammabilityEncouragementValue: modalState.flammabilityEncouragement,
        flammability: modalState.flammability,
        lightLevel: modalState.lightLevel,
        minSpawn: modalState.minSpawn,
        maxSpawn: modalState.maxSpawn,
        harvestTool: modalState.harvestTool,
        harvestToolQualities: modalState.harvestToolQualities,
      })
      .then(() => props.dimiss())
  }
  /**
   * Helper method to set string state values in the reducer
   *
   * This only exists so that we don't need to make a state handler for each string value in the reducer state.
   *
   */
  const setStringValueHandler = (args: {
    payload: { [key: string]: string }
    type: BLOCK_MODAL_ACTION
  }) =>
    dispatch({
      ...args,
    })
  /**
   * Helper method to set number state values in the reducer
   *
   * This only exists so that we don't need to make a state handler for each number value in the reducer state.
   *
   */
  const numberInputHandler = (
    payload: { [key: string]: number },
    range: { min: number; max: number },
    action: BLOCK_MODAL_ACTION
  ) => {
    const key = Object.keys(payload)[0]
    if (payload[key] >= range.min && payload[key] <= range.max) {
      dispatch({
        type: action,
        payload,
      })
    }
  }

  const setHarvestToolHandler = (harvestTool: string) =>
    dispatch({
      type: BLOCK_MODAL_ACTION.SET_HARVEST_TOOL,
      payload: {
        harvestTool,
      },
    })

  const setHarvestToolQualitiesHandler = (quality: string) => {
    const newQualitiesArray = modalState.harvestToolQualities as string[]
    if (newQualitiesArray.includes(quality)) {
      newQualitiesArray.splice(newQualitiesArray.indexOf(quality), 1)
    } else {
      newQualitiesArray.push(quality)
    }
    dispatch({
      type: BLOCK_MODAL_ACTION.SET_HARVEST_TOOL_QUALITIES,
      payload: {
        harvestToolQualities: newQualitiesArray,
      },
    })
  }

  // Saving should be disabled when any of these values are unset
  const saveButtonDisabled =
    modalState.title.length === 0 ||
    modalState.top === NONE ||
    modalState.right === NONE ||
    modalState.left === NONE ||
    modalState.harvestTool === `` ||
    modalState.harvestToolQualities.length === 0
  return (
    <>
      <div className="modal-overlay" />
      <div className="modal rounded-lg">
        <div className="modal-title">
          <h1>{props.blockModelData.block}</h1>
          <input
            className="modal-input"
            type="text"
            placeholder="In-game title (e.g., 'Cobblestone')"
            value={modalState.title}
            onChange={(e) => {
              const payload = {} as any
              payload.title = e.target.value
              setStringValueHandler({
                payload,
                type: BLOCK_MODAL_ACTION.SET_TITLE,
              })
            }}
          />
        </div>
        <br />
        <div className="block-icon-config">
          <h2 className="text-xl font-bold">Block icon</h2>
          <p className="italic text-justify mx-8">
            Each texture name is shown alongside its corresponding texture
            image. Select the images to use for the top, left and right sides.
            These images will be used to generate an isometric view of your
            block. <b>The same image may be used for multiple sides.</b>
          </p>
          {Object.keys(blockTextures).map((textureName) => (
            <div key={`${textureName}_scaled_row`} className="mx-20">
              <div className="grid grid-cols-2">
                <div className="font-bold m-auto">
                  {textureName.replace(`blocks/`, ``)}
                </div>
                <div>
                  <img
                    className="m-4 mx-auto"
                    src={blockTextures[textureName]}
                    alt={textureName}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 mx-8">
            {[`top`, `left`, `right`].map((side) => {
              let type: string
              switch (side) {
                case `top`: {
                  type = BLOCK_MODAL_ACTION.SET_TOP
                  break
                }
                case `left`: {
                  type = BLOCK_MODAL_ACTION.SET_LEFT
                  break
                }
                case `right`: {
                  type = BLOCK_MODAL_ACTION.SET_RIGHT
                  break
                }
              }
              return (
                <div className="modal-dropdown-row">
                  <h3>{side}</h3>
                  <select
                    value={modalState[side]}
                    onChange={(e) => {
                      const payload = {} as any
                      payload[side] = e.target.value
                      setStringValueHandler({
                        payload,
                        type: type as BLOCK_MODAL_ACTION,
                      })
                    }}
                  >
                    <option value="none">none</option>
                    {renderDropdownOptions()}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
        <br />
        <div className="mx-2">
          <h2 className="text-xl font-bold">Block data</h2>
          <BlockModalNumberInput
            label="Light Level"
            value={modalState.lightLevel}
            onChangeHandler={(e) =>
              numberInputHandler(
                {
                  lightLevel: parseInt(e.target.value),
                },
                RANGES.lightLevel,
                BLOCK_MODAL_ACTION.SET_LIGHT_LEVEL
              )
            }
          />
          <BlockModalNumberInput
            label="Flammability Encouragement Value"
            value={modalState.flammabilityEncouragement}
            onChangeHandler={(e) =>
              numberInputHandler(
                {
                  flammabilityEncouragement: parseInt(e.target.value),
                },
                RANGES.flammabilityEncouragement,
                BLOCK_MODAL_ACTION.SET_FLAMMABILITY_ENCOURAGEMENT
              )
            }
          />
          <BlockModalNumberInput
            label="Flammability Value"
            value={modalState.flammability}
            onChangeHandler={(e) =>
              numberInputHandler(
                {
                  flammability: parseInt(e.target.value),
                },
                RANGES.flammability,
                BLOCK_MODAL_ACTION.SET_FLAMMABILITY
              )
            }
          />
          <BlockModalNumberInput
            label="Min Spawn Level"
            value={modalState.minSpawn}
            onChangeHandler={(e) =>
              numberInputHandler(
                {
                  minSpawn: parseInt(e.target.value),
                },
                RANGES.spawnLevel,
                BLOCK_MODAL_ACTION.SET_MIN_SPAWN
              )
            }
          />
          <BlockModalNumberInput
            label="Max Spawn Level"
            value={modalState.maxSpawn}
            onChangeHandler={(e) =>
              numberInputHandler(
                {
                  maxSpawn: parseInt(e.target.value),
                },
                RANGES.spawnLevel,
                BLOCK_MODAL_ACTION.SET_MAX_SPAWN
              )
            }
          />
          <div>
            <h3 className="font-bold text-center">Harvest Tool</h3>
            <div className="text-center">
              {HARVEST_TOOLS.map((tool) => (
                <div
                  key={`tool_select_${tool}`}
                  className="inline-block mx-2 mb-4"
                >
                  <input
                    type="radio"
                    value={tool}
                    onChange={(e) => setHarvestToolHandler(e.target.value)}
                    checked={modalState.harvestTool === tool}
                  />
                  <div>{tool}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-center">Harvest Tool Quality</h3>
            <div className="text-center">
              {HARVEST_TOOL_QUALITIES.map((quality) => (
                <div className="inline-block mx-2 mb-4">
                  <input
                    type="checkbox"
                    value={quality}
                    disabled={
                      ((modalState.harvestTool === `none` ||
                        modalState.harvestTool === `hand`) &&
                        quality !== `none`) ||
                      ((modalState.harvestTool !== `none` ||
                        modalState.harvestTool !== `hand`) &&
                        quality === `none`)
                    }
                    checked={modalState.harvestToolQualities.includes(quality)}
                    onChange={(e) =>
                      setHarvestToolQualitiesHandler(e.target.value)
                    }
                  />
                  <div>{quality}</div>
                </div>
              ))}
            </div>
          </div>
          {/* TODO: Decide how to handle entity linking */}
        </div>
        <div className="modal-button-row">
          <button className="modal-dismiss-button" onClick={props.dimiss}>
            Dismiss
          </button>
          <button
            className={
              !!saveButtonDisabled
                ? `modal-save-button-disabled`
                : `modal-save-button`
            }
            onClick={saveHandler}
            disabled={saveButtonDisabled}
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
