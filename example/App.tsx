import { WiseTable, defineColumns, z } from '../src/lib'

// Schema for validation
const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older').max(100),
  status: z.enum(['active', 'inactive', 'pending']),
})

// Infer type from schema
type User = z.infer<typeof userSchema>

// Sample data
const sampleData: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 28,
    status: 'active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 32,
    status: 'active',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 45,
    status: 'inactive',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice@example.com',
    age: 24,
    status: 'active',
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    age: 38,
    status: 'pending',
  },
]

// Define columns
const columns = defineColumns<User>(
  {
    key: 'id',
    label: 'ID',
    type: 'number' as const,
    readonly: true,
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text' as const,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text' as const,
  },
  {
    key: 'age',
    label: 'Age',
    type: 'number' as const,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
  },
)

export function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <WiseTable
          columns={columns}
          idColumn="id"
          schema={userSchema}
          crudActions={{
            useQuery: () =>
              ({
                data: { data: sampleData },
                isLoading: false,
                error: null,
              }) as never,
          }}
        />
      </div>
    </div>
  )
}
