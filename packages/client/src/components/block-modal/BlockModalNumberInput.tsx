import React from "react"

export const BlockModalNumberInput = (props: {
  label: string
  value: number
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div>
    {props.label}
    <input
      className="flex float-right w-10 focus:outline-none"
      type="number"
      value={props.value}
      onChange={props.onChangeHandler}
    />
  </div>
)
