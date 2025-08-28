import type { UseMutationResult } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { CRUDActions } from '../../src/lib'
import { employeeApi } from '../mock/employeeService'
import type { Employee } from './schemas'

// CRUD Actions handlers
export const createEmployeeCrudActions = (queryClient: {
  invalidateQueries: (options: { queryKey: string[]; exact: boolean }) => void
}): CRUDActions<Employee> => ({
  useQuery: ({
    page,
    limit,
    filters,
  }: {
    page: number
    limit: number
    filters?: Record<string, unknown>
  }) =>
    useQuery({
      queryKey: ['employees', { page, limit, filters }],
      queryFn: async () => {
        const res = await employeeApi.fetchEmployees({
          page,
          pageSize: limit,
          filters,
        })
        return res
      },
    }),
  useCreateMutation: () =>
    useMutation({
      mutationFn: async (items: Array<Omit<Employee, 'id'>>) => {
        await employeeApi.createEmployees(items)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['employees'],
          exact: false,
        })
      },
    }) as unknown as UseMutationResult<void, Error, unknown[]>,
  useUpdateMutation: () =>
    useMutation({
      mutationFn: async ({
        items,
        reason,
      }: {
        items: Employee[]
        reason?: string
      }) => {
        const updates = items.map((e) => ({ id: e.id, data: e }))
        await employeeApi.updateEmployees(updates, reason)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['employees'],
          exact: false,
        })
      },
    }),
  useDeleteMutation: () =>
    useMutation({
      mutationFn: async ({
        items,
        reason,
      }: {
        items: Employee[]
        reason?: string
      }) => {
        await employeeApi.deleteEmployees(
          items.map((e) => e.id),
          reason,
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['employees'],
          exact: false,
        })
      },
    }),
})
