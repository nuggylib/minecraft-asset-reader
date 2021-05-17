// Defines the Int type
export type Int = number & { __int__: void }

export const roundToInt = (num: number): Int => Math.round(num) as Int

// TODO: Implement this patter for all internal APIs; need to do a lot of cleanup and standardization
export type MutationResult = {
  success: boolean
  message?: string
  data?: any
}
