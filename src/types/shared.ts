// Defines the Int type
export type Int = number & { __int__: void }

export const roundToInt = (num: number): Int => Math.round(num) as Int

export type MutationResult = {
  success: boolean
  id?: Int
  message?: string
  data?: any
}

export type QueryResult = {
  id: Int
  data: any
}
