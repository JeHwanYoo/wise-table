import type { TableActionsProps } from '../../src/lib/WiseTable/internal/TableActions'

// TableActions configuration for Employee table
export const employeeTableActions: TableActionsProps = {
  createButton: {
    text: 'New Employee',
    title: 'Create new employee',
  },
  saveButton: {
    text: 'Save Changes',
    title: 'Save changes',
  },
  deleteButton: {
    text: 'Delete Selected',
    title: 'Delete selected employees',
  },
  rightContent: <div className="text-xs text-gray-500">Table Actions</div>,
}
