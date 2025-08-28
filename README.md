# 🧠 Wise Table

**A powerful React table library designed for modern data-driven applications**

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yujehwan/wise-table/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-18%2B%7C19%2B-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5%2B-FF4154?logo=react-query)](https://tanstack.com/query/latest)
[![Zod](https://img.shields.io/badge/Zod-3%2B%7C4%2B-3E67B1?logo=zod)](https://zod.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.2%2B-blue)](https://bun.sh/)

> **🚧 Work in Progress (WIP)**  
> This library is currently under active development. APIs may change and features may be incomplete. Use with caution in production environments.

Wise Table is a high-performance React table library designed for modern web applications. Built with both user experience and developer convenience in mind, featuring **React Query integration** and **Zod schema validation**.

## ✨ Features

### 🚀 React Query Integration

- **Server State Management**: Built-in TanStack Query integration through CRUDActions pattern
- **Automatic Caching**: Leverage React Query's caching and background synchronization
- **Query Integration**: Seamless integration with useQuery for data fetching
- **Mutation Support**: Built-in support for create, update, and delete mutations

### 🛡️ Type-Safe Schema Validation

- **Zod Integration**: Full Zod schema support for runtime validation and type inference
- **TypeScript First**: Complete type safety from schemas to components
- **Multi-Schema Support**: Separate schemas for display, create, update, and query operations
- **Compile-time Safety**: Catch type mismatches during development

### 📊 Advanced Data Operations

- **Multi-row Selection**: Built-in selection state management with bulk operations
- **CRUD Operations**: Complete Create, Read, Update, Delete support with reason tracking
- **Smart Filtering**: Advanced filtering with query string integration
- **Modal-based Operations**: User-friendly modals for create, update, and delete operations

### 🎯 Dynamic Select Options

- **Static Options**: Traditional static dropdown options support
- **Dynamic Options**: Server-side data fetching with `useSelectQuery` integration
- **Loading States**: Built-in loading and error states for dynamic options
- **Flexible Integration**: Mix static and dynamic selects in the same table

### 📊 Rich Column Types

- **Basic Types**: text, number, currency, date, boolean, enum
- **Advanced Types**: searchableSelect, multipleSelect, textArea
- **Custom Renderers**: Full control over cell rendering with custom render functions
- **Inline Editing**: Click-to-edit functionality with type-appropriate inputs

### 🔄 Real-time Data Management

- **Instant Feedback**: Real-time visual feedback for data changes
- **Dirty State Tracking**: Clear indication of modified rows and cells
- **Change Validation**: Schema-based validation during editing
- **Optimistic Updates**: Immediate UI updates with server synchronization

### 🎨 Developer Experience

- **Component-based Architecture**: Modular design with reusable components
- **Developer-First**: Built for complex business logic and back-office applications
- **Customizable UI**: Extensive theming and styling options
- **Comprehensive TypeScript**: Full type coverage for enhanced developer experience

## 🚀 Installation

### For Library Users

> **📝 TODO**: Package will be published to npm after stable release.

**Required Peer Dependencies**

```bash
npm install @tanstack/react-query zod react react-dom
# or
yarn add @tanstack/react-query zod react react-dom
# or
pnpm add @tanstack/react-query zod react react-dom
# or
bun add @tanstack/react-query zod react react-dom
```

> **💡 Why Peer Dependencies?**  
> Wise Table uses peer dependencies to avoid version conflicts and give you full control over your data management stack. This ensures compatibility with your existing React Query setup.

### For Development

```bash
# Clone the repository
git clone https://github.com/yujehwan/wise-table.git
cd wise-table

# Install dependencies with Bun
bun install

# Start example app for local demo
bun run dev

# Build library once
bun run build && bun run types

# Or start live development (watch build/types/lint)
bun run dev:lib
```

> ⚠️ Recommended for development: follow the "Local Linking & Live Development" section to connect a consumer repo, iterate quickly, and validate changes live without publishing to npm.

For more information on installing Bun, refer to the [Bun Installation Guide](https://bun.sh/docs/installation).

## 📖 Documentation

> **📝 TODO**: Comprehensive documentation will be available after stable release.

### Quick Start

> **📝 TODO**: Usage examples and tutorials coming soon.

### API Reference

> **📝 TODO**: Complete API documentation will be provided.
