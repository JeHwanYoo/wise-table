import type { FilterOptions, SelectOption } from '../../src/lib'
import type { QueryEmployeeDTO } from './schemas'

// Department options - shared between columns and filters
export const departmentOptions: SelectOption<string>[] = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'HR', value: 'HR' },
  { label: 'Finance', value: 'Finance' },
]

// Role options - shared between columns and filters
export const roleOptions: SelectOption<string>[] = [
  { label: 'Junior', value: 'Junior' },
  { label: 'Mid', value: 'Mid' },
  { label: 'Senior', value: 'Senior' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Director', value: 'Director' },
]

// Filter options configuration
export const filterOptions: FilterOptions<QueryEmployeeDTO> = {
  fields: [
    { key: 'name', label: 'Name', type: 'string' as const },
    { key: 'email', label: 'Email', type: 'string' as const },
    { key: 'age', label: 'Age', type: 'number' as const },
    {
      key: 'department',
      label: 'Department',
      type: 'select' as const,
      // Function-based options - can use hooks inside!
      options: () => {
        // This function will be called each time the filter dropdown is rendered
        // You can use React hooks here if needed
        return [{ label: 'All', value: '' }, ...departmentOptions]
      },
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select' as const,
      options: [{ label: 'All', value: '' }, ...roleOptions],
    },
    { key: 'isActive', label: 'Active', type: 'boolean' as const },
    { key: 'hiredDate', label: 'Hired Date', type: 'date' as const },
  ],
}
