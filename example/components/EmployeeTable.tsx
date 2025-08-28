import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { WiseTable, WiseTableButton } from '../../src/lib'
import { employeeColumns } from '../configs/columns'
import { createEmployeeCrudActions } from '../configs/crudActions'
import { filterOptions } from '../configs/filterOptions'
import {
  CreateEmployeeSchema,
  EmployeeSchema,
  QueryEmployeeSchema,
  UpdateEmployeeSchema,
} from '../configs/schemas'
import { employeeTableActions } from '../configs/tableActions'
import { createDefaultValues, requireReason } from '../configs/tableSettings'
import {
  departmentApi,
  employeeDev,
  seedDepartmentData,
  seedEmployeeData,
} from '../mock/employeeService'

export function EmployeeTable() {
  const queryClient = useQueryClient()
  const [isReseeding, setIsReseeding] = useState(false)

  const crudActions = createEmployeeCrudActions(queryClient as QueryClient)

  // Create departments query hook
  const useDepartmentsQuery = () =>
    useQuery({
      queryKey: ['departments'],
      queryFn: departmentApi.fetchDepartments,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })

  // Create dynamic columns with useSelectQuery
  const dynamicColumns = employeeColumns.map((column) => {
    if (column.key === 'department') {
      return {
        ...column,
        useSelectQuery: useDepartmentsQuery,
        // Remove static options to test dynamic behavior
        options: undefined,
      }
    }
    return column
  })

  const handleReseed = async () => {
    setIsReseeding(true)
    try {
      // Generate random seed for dynamic data generation
      const randomSeed = Math.floor(Math.random() * 100000)
      // This will generate 200-300 employees with random seed
      await employeeDev.reseed(
        randomSeed,
        Math.floor(Math.random() * 100) + 200,
      )

      queryClient.invalidateQueries({
        queryKey: ['employees'],
        exact: false,
      })
    } finally {
      setIsReseeding(false)
    }
  }

  useEffect(() => {
    seedEmployeeData()
    seedDepartmentData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Employee Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Dynamic employee data generation using Faker.js
          </p>
        </div>
        <WiseTableButton
          variant="secondary"
          size="md"
          onClick={handleReseed}
          disabled={isReseeding}
        >
          {isReseeding ? '🔄 Generating...' : '🎲 Generate New Data (200-300)'}
        </WiseTableButton>
      </div>

      <WiseTable<typeof EmployeeSchema>
        idColumn="id"
        columns={dynamicColumns}
        schema={EmployeeSchema}
        createSchema={CreateEmployeeSchema}
        updateSchema={UpdateEmployeeSchema}
        querySchema={QueryEmployeeSchema}
        filterOptions={filterOptions}
        defaultFilters={{}}
        createDefaultValues={createDefaultValues}
        requireReason={requireReason}
        enableFilters={true}
        tableActions={employeeTableActions}
        crudActions={crudActions}
        tableHeight="500px"
      />
    </div>
  )
}
