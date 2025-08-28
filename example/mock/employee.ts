import { faker } from '@faker-js/faker'
import type { Employee } from '../configs/schemas'

// Predefined options for consistent data generation
const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
] as const
const ROLES = [
  'Junior',
  'Mid',
  'Senior',
  'Lead',
  'Manager',
  'Director',
] as const
const SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'Git',
  'Agile',
  'Scrum',
  'Leadership',
  'Communication',
  'Project Management',
] as const

/**
 * Generate fake employee data using faker
 * @param seed - Optional seed for reproducible results
 * @param count - Number of employees to generate (default: random between 50-100)
 */
export function generateEmployees(seed?: number, count?: number): Employee[] {
  // Set seed for reproducible results
  if (seed !== undefined) {
    faker.seed(seed)
  }

  // Generate random count if not provided
  const employeeCount = count ?? faker.number.int({ min: 50, max: 100 })
  const employees: Employee[] = []

  for (let i = 1; i <= employeeCount; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const name = `${firstName} ${lastName}`
    const domain = faker.helpers.arrayElement([
      'company.com',
      'corp.com',
      'enterprise.com',
    ])

    // Generate random skills (1-5 skills per employee)
    const skillCount = faker.number.int({ min: 1, max: 5 })
    const employeeSkills = faker.helpers.arrayElements(SKILLS, skillCount)

    const employee: Employee = {
      id: i,
      name,
      email: faker.internet.email({ firstName, lastName, provider: domain }),
      age: faker.number.int({ min: 22, max: 65 }),
      salary: faker.number.int({ min: 45000, max: 200000 }),
      department: faker.helpers.arrayElement(DEPARTMENTS),
      role: faker.helpers.arrayElement(ROLES),
      hiredDate: faker.date
        .between({
          from: '2018-01-01',
          to: new Date(),
        })
        .toISOString()
        .split('T')[0],
      isActive: faker.datatype.boolean({ probability: 0.85 }), // 85% chance of being active
      skills: employeeSkills,
      memo: faker.helpers.maybe(
        () => faker.lorem.sentences({ min: 1, max: 3 }),
        { probability: 0.7 },
      ), // 70% chance of having memo
    }

    employees.push(employee)
  }

  return employees
}

// Generate initial employees with a default seed for consistency
export const initialEmployees: Employee[] = generateEmployees(12345, 63)
