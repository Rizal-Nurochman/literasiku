import { logger } from './logger'

export const apiCall = async <T>(promise: Promise<T>): Promise<[unknown, T | null]> => {
  try {
    return [null, await promise]
  } catch (error) {
    logger.error(error)
    return [error, null]
  }
}

export const throwError = (error: any): never => {
  logger.error({
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?._data,
  })

  throw createError({
    statusCode: error?.response?.status ?? 500,
    statusMessage:
      error?.response?._data?.message ??
      error?.message ??
      'Gagal terhubung ke backend utama',
    data: error?.response?._data,
  })
}