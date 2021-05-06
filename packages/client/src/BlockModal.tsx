import React, { useEffect, useReducer } from "react"
import { useScaledBlockImages } from "./hooks/useScaledBlockImages"
import { BlockModelData } from "./minecraft/types"
import axios from "axios"

const NONE = `none`

enum BLOCK_MODAL_ACTION {
  SET_TITLE = `set_title`,
  SET_TOP = `set_top`,
  SET_LEFT = `set_left`,
  SET_RIGHT = `set_right`,
  LOAD_CACHED = `load_cached`,
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
    case BLOCK_MODAL_ACTION.LOAD_CACHED: {
      return {
        title: action.payload.title,
        top: action.payload.top,
        left: action.payload.left,
        right: action.payload.right,
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
  const [modalState, dispatch] = useReducer(reducer, {
    title: ``,
    top: NONE,
    left: NONE,
    right: NONE,
  })

  const blockTextures = useScaledBlockImages({
    namespace: props.namespace,
    block: props.blockModelData.block,
    scale: 8,
  })

  const renderDropdownOptions = () =>
    Object.keys(blockTextures).map((textureName) => (
      <option key={`${textureName}_opt`} value={`${textureName}`}>
        {textureName.replace(`blocks/`, ``)}
      </option>
    ))

  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/content-map/block?namespace=${props.namespace}&block=${props.blockModelData.block}`
      )
      .then((res) => {
        const { title, iconData } = res.data

        if (title && iconData) {
          dispatch({
            type: BLOCK_MODAL_ACTION.LOAD_CACHED,
            payload: {
              title,
              top: iconData.top.replace(`blocks/`, ``),
              left: iconData.sideL.replace(`blocks/`, ``),
              right: iconData.sideR.replace(`blocks/`, ``),
            },
          })
        }
      })
  }, [
    modalState.title,
    modalState.top,
    modalState.left,
    modalState.right,
    props.namespace,
    props.blockModelData.block,
  ])

  const setTopHandler = (e: any) =>
    dispatch({
      type: BLOCK_MODAL_ACTION.SET_TOP,
      payload: { top: e.target.value },
    })
  const setRightHandler = (e: any) =>
    dispatch({
      type: BLOCK_MODAL_ACTION.SET_RIGHT,
      payload: { right: e.target.value },
    })
  const setLeftHandler = (e: any) =>
    dispatch({
      type: BLOCK_MODAL_ACTION.SET_LEFT,
      payload: { left: e.target.value },
    })
  const setTitleHandler = (e: any) =>
    dispatch({
      type: BLOCK_MODAL_ACTION.SET_TITLE,
      payload: { title: e.target.value },
    })
  const saveHandler = () => {
    axios
      .post(`http://localhost:3000/content-map/blocks`, {
        namespace: props.namespace,
        blocks: {
          [props.blockModelData.block]: {
            title: modalState.title,
            iconData: {
              top: `${modalState.top}`,
              sideL: `${modalState.left}`,
              sideR: `${modalState.right}`,
            },
          },
        },
      })
      .then(() => props.dimiss())
  }

  // Saving should be disabled when any of these values are unset
  const saveButtonDisabled =
    modalState.title.length === 0 ||
    modalState.top === NONE ||
    modalState.right === NONE ||
    modalState.left === NONE
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
            onChange={setTitleHandler}
          />
        </div>
        <br />
        <div className="block-icon-config">
          <h2 className="text-xl font-bold">Block icon configuration</h2>
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
              let val
              let handler
              switch (side) {
                case `top`: {
                  val = modalState.top
                  handler = setTopHandler
                  break
                }
                case `left`: {
                  val = modalState.left
                  handler = setLeftHandler
                  break
                }
                case `right`: {
                  val = modalState.right
                  handler = setRightHandler
                  break
                }
              }
              return (
                <div className="modal-dropdown-row">
                  <h3>{side}</h3>
                  <select value={val} onChange={handler}>
                    <option value="none">none</option>
                    {renderDropdownOptions()}
                  </select>
                </div>
              )
            })}
          </div>
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
