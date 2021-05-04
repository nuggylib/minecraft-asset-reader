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
  }, [modalState.title, modalState.top, modalState.left, modalState.right])

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
        </div>
        <br />
        <table className="table-auto mx-auto">
          <thead>
            <tr>
              <th>Texture Name</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(blockTextures).map((textureName) => (
              <tr key={`${textureName}_scaled_row`}>
                <td>{textureName.replace(`blocks/`, ``)}</td>
                <td>
                  <img
                    className="m-4 mx-auto"
                    src={blockTextures[textureName]}
                    alt={textureName}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center">
          <input
            className="modal-input"
            type="text"
            placeholder="Title"
            value={modalState.title}
            onChange={setTitleHandler}
          />
          <div className="modal-dropdown-row">
            <h3>top</h3>
            <select value={modalState.top} onChange={setTopHandler}>
              <option value="none">none</option>
              {renderDropdownOptions()}
            </select>
          </div>
          <div className="modal-dropdown-row">
            <h3>sideL</h3>
            <select value={modalState.left} onChange={setLeftHandler}>
              <option value="none">none</option>
              {renderDropdownOptions()}
            </select>
          </div>
          <div className="modal-dropdown-row">
            <h3>sideR</h3>
            <select value={modalState.right} onChange={setRightHandler}>
              <option value="none">none</option>
              {renderDropdownOptions()}
            </select>
          </div>
        </div>
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
    </>
  )
}
