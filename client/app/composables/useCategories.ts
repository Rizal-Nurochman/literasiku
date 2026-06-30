import { useQuery } from '@tanstack/vue-query'
import type { CategoriesResponse } from '#shared/types/categories'

export const useCategories = () => {
  const CATEGORY_KEY = 'categories'

  const useCategoriesList = (params?: {
    page?: Ref<number>
    limit?: Ref<number>
    search?: Ref<string>
  }) => {
    return useQuery({
      queryKey: [CATEGORY_KEY, 'list', params?.page, params?.limit, params?.search],
      queryFn: () => $fetch<CategoriesResponse>('/api/categories', {
        query: {
          page: params?.page?.value ?? 1,
          limit: params?.limit?.value ?? 100,
          search: params?.search?.value || undefined
        }
      })
    })
  }

  return {
    useCategoriesList
  }
}
