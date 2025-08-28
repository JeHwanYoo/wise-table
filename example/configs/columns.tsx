import type { WiseTableColumn } from '../../src/lib'
import { departmentOptions, roleOptions } from './filterOptions'
import type { Employee } from './schemas'

export const employeeColumns: WiseTableColumn<Employee>[] = [
  {
    key: 'id',
    label: 'ID',
    render: (id) => (
      <a className="text-blue-500 hover:underline" href="#" target="_blank">
        {id}
      </a>
    ),
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'age',
    label: 'Age',
    type: 'number',
  },
  {
    key: 'salary',
    label: 'Salary',
    type: 'currency',
    locale: 'en-US',
    currencyOptions: {
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    },
  },
  {
    key: 'department',
    label: 'Department',
    options: departmentOptions,
  },
  {
    key: 'role',
    label: 'Role',
    options: roleOptions,
  },
  {
    key: 'hiredDate',
    label: 'Hired Date',
    type: 'date',
    dateFormat: 'MM/dd/yyyy',
  },
  {
    key: 'isActive',
    label: 'Status',
    options: [
      {
        label: 'Active',
        value: true,
        badge: { color: 'emerald', intensity: 100 },
      },
      {
        label: 'Inactive',
        value: false,
        badge: { color: 'rose', intensity: 100 },
      },
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'multiselect',
    options: [
      { label: 'JavaScript', value: 'JavaScript' },
      { label: 'TypeScript', value: 'TypeScript' },
      { label: 'React', value: 'React' },
      { label: 'Node.js', value: 'Node.js' },
      { label: 'Python', value: 'Python' },
      { label: 'Java', value: 'Java' },
      { label: 'SQL', value: 'SQL' },
      { label: 'AWS', value: 'AWS' },
      { label: 'Docker', value: 'Docker' },
      { label: 'Kubernetes', value: 'Kubernetes' },
      { label: 'GraphQL', value: 'GraphQL' },
      { label: 'MongoDB', value: 'MongoDB' },
      { label: 'PostgreSQL', value: 'PostgreSQL' },
      { label: 'Redis', value: 'Redis' },
      { label: 'Git', value: 'Git' },
      { label: 'Agile', value: 'Agile' },
      { label: 'Scrum', value: 'Scrum' },
      { label: 'Leadership', value: 'Leadership' },
      { label: 'Communication', value: 'Communication' },
      { label: 'Project Management', value: 'Project Management' },
    ],
    render: (skills) => (
      <div className="flex flex-wrap gap-1">
        {((skills as string[]) || []).map((skill) => (
          <span
            key={skill}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}
          >
            {skill}
          </span>
        ))}
      </div>
    ),
  },
  {
    key: 'memo',
    label: 'Memo',
    type: 'textArea',
  },
]
