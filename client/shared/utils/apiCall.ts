export const apiCall = async <T>(promise: Promise<T>): Promise<[any, T | null]> => {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}
