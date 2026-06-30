import { useQuery } from '@tanstack/vue-query'
import type { FileResponse } from '#shared/types/files'

export const useFiles = () => {
  const useBookFiles = (bookId: Ref<number | string>) => {
    return useQuery({
      queryKey: ['files', 'book', bookId],
      queryFn: () => $fetch<FileResponse[]>(`/api/files/book/${bookId.value}`),
      enabled: computed(() => !!bookId.value)
    })
  }

  return {
    useBookFiles
  }
}
