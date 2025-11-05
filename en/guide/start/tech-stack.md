# Tech Stack

## Backend

### Core language and Framework

- Rust: A high-performance memory-safe language
- Axum: A Rust Web framework based on Tokio

### Database and Storage

- PostgreSQL: A persistent database that interacts via SeaORM
- Valkey: Used for caching and accessed via fred.rs

### Message queues and Asynchronous processing

- NATS: A lightweight message queue for communication between components

### Containers and Orchestration

- Kubernetes: The dynamic environment support for challenges via kube-rs

### Security and Authentication

- Argon2: Used for password hashing
- Ring & Rustls: Provides encryption functionality

### Script engine

- Rune: A secure embedded scripting language for submission checkers

### Monitoring and Logging

- OpenTelemetry: For distributed tracing and monitoring
- Tracing: Used for structured logging

## Frontend

### Core framework and Language

- React: Used for building user interfaces
- TypeScript: Used for type-safe JavaScript development

### Build tools

- Vite: A modern front-end build tool

### UI Components and styles

- Tailwind CSS: A CSS framework that prioritizes practicality
- Radix UI: A style-free and accessible UI component
- Lucide React: Icon library

### Status management and Data fetching

- Zustand: A lightweight state management library
- Ky: A data fetching library based on Fetch
- TanStack Query: A server-state management and caching library

### Form processing and Validation

- React Hook Form: Form processing library
- Zod: Type validation library

### Internationalization and Localization

- i18next: Internationalization Framework

### Charts and Visualization

- Recharts: A chart library based on React
