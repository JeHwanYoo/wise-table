import type {
  CreateDefaultValues,
  ReasonRequirements,
} from '../../src/lib/WiseTable/internal/WiseTableCore'
import type { EmployeeSchema } from './schemas'

// Create modal default values
export const createDefaultValues: CreateDefaultValues<typeof EmployeeSchema> = {
  hiredDate: new Date().toISOString().split('T')[0],
  isActive: true,
  skills: [],
}

// Reason requirements for CRUD operations
export const requireReason: ReasonRequirements = {
  create: false,
  update: true,
  delete: true,
}
