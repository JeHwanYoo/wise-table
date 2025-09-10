import { z } from 'zod'

// Base Employee data schema (for display/read)
export const EmployeeSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  age: z.number().min(18, 'Must be at least 18').max(100, 'Invalid age'),
  salary: z.number().min(0, 'Salary must be positive'),
  department: z.enum(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']),
  role: z.enum(['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director']),
  hiredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  isActive: z.boolean(),
  skills: z.array(z.string()).default([]), // Multiple select for skills
  memo: z.string().optional(),
})

// Create DTO Schema (no ID, some fields optional)
export const CreateEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  age: z.number().min(18, 'Must be at least 18').max(100, 'Invalid age'),
  salary: z.number().min(0, 'Salary must be positive'),
  department: z.enum(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']),
  role: z.enum(['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director']),
  hiredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  isActive: z.boolean(),
  skills: z.array(z.string()).default([]),
  memo: z.string().optional(),
})

// Query DTO Schema (for filtering)
export const QueryEmployeeSchema = z.object({
  search: z.string().optional(),
  // New optional filters aligned with UI
  name: z.string().optional(),
  email: z.string().optional(),
  age: z.number().optional(),
  department: z
    .enum(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'])
    .optional(),
  role: z
    .enum(['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'])
    .optional(),
  isActive: z.boolean().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  // Date range for hiredDate
  hiredDate: z.string().optional(),
  start_hiredDate: z.string().optional(),
  end_hiredDate: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(25),
})

export type Employee = z.infer<typeof EmployeeSchema>
export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>
export type QueryEmployeeDTO = z.infer<typeof QueryEmployeeSchema>
