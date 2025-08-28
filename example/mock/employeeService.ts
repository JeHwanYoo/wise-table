import type { SelectOption } from '../../src/lib'
import {
  CreateEmployeeSchema,
  type Employee,
  EmployeeSchema,
} from '../configs/schemas'
import { generateEmployees, initialEmployees } from './employee'
import { MockServer } from './server'

export const employeeServer = new MockServer<Employee, 'id'>('employees', 'id')

// Department data structure
interface Department {
  id: number
  name: string
  description?: string
}

export const departmentServer = new MockServer<Department, 'id'>(
  'departments',
  'id',
)

// Initial departments data
const initialDepartments: Omit<Department, 'id'>[] = [
  {
    name: 'Engineering',
    description: 'Software development and technical operations',
  },
  {
    name: 'Marketing',
    description: 'Brand promotion and customer acquisition',
  },
  {
    name: 'Sales',
    description: 'Revenue generation and customer relationships',
  },
  { name: 'HR', description: 'Human resources and employee management' },
  { name: 'Finance', description: 'Financial planning and accounting' },
]

// Seed departments data
export async function seedDepartmentData() {
  const stats = departmentServer.getStats()
  if (stats.recordCount === 0) {
    await departmentServer.seed(initialDepartments)
  }
}

export async function seedEmployeeData() {
  const stats = employeeServer.getStats()
  if (stats.recordCount === 0) {
    await employeeServer.seed(initialEmployees)
  }
}

export const employeeApi = {
  async fetchEmployees(params?: {
    page?: number
    pageSize?: number
    filters?: Record<string, unknown>
  }) {
    const response = await employeeServer.fetch({
      page: params?.page,
      pageSize: params?.pageSize ?? 25,
      sortBy: 'id',
      sortDir: 'desc',
      filters: params?.filters,
    })
    return response
  },

  async createEmployees(data: Array<Omit<Employee, 'id'>>, reason?: string) {
    const validatedData = data.map((employee) => {
      const result = CreateEmployeeSchema.safeParse(employee)
      if (!result.success) {
        throw new Error(`Invalid employee data: ${result.error.message}`)
      }
      return result.data
    })

    const createData = validatedData

    const createdEmployees = await employeeServer.create(createData, reason)

    return createdEmployees
  },

  async updateEmployees(
    updates: Array<{ id: number; data: Partial<Employee> }>,
    reason?: string,
  ) {
    const validatedUpdates = updates.map((update) => {
      const result = EmployeeSchema.partial().safeParse(update.data)
      if (!result.success) {
        throw new Error(`Invalid update data: ${result.error.message}`)
      }
      return { ...update, data: result.data }
    })

    return await employeeServer.update(validatedUpdates, reason)
  },

  async deleteEmployees(ids: number[], reason?: string) {
    await employeeServer.delete(ids, reason)
  },
}

// Department API
export const departmentApi = {
  async fetchDepartments(): Promise<SelectOption<string>[]> {
    // Simulate network delay for dynamic loading demonstration
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await departmentServer.fetch({ pageSize: 100 })
    return response.data.map((dept) => ({
      label: dept.name,
      value: dept.name,
    }))
  },
}

export const employeeDev = {
  async clearAll() {
    await employeeServer.clear()
  },

  async reseed(seed?: number, count?: number) {
    await this.clearAll()
    const newEmployees = generateEmployees(seed, count)
    await employeeServer.seed(newEmployees)
  },

  async generateNewData(seed?: number, count?: number) {
    await this.clearAll()
    const newEmployees = generateEmployees(seed, count)
    await employeeServer.seed(newEmployees)
    return newEmployees
  },

  getStats() {
    return employeeServer.getStats()
  },
}
