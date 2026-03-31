# Repository Guidelines

Handcrafted Haven is a Next.js 16 full-stack application (App Router) built with TypeScript, Tailwind CSS, and MongoDB (Mongoose). It serves as a marketplace for artisans to sell their products.

## Project Structure & Module Organization

- **`src/app/`**: Contains the application's routes, layouts, and API endpoints. 
- **`src/components/`**: Houses reusable UI components.
- **`src/context/`**: React contexts for global state management.
- **`src/lib/`**: Utility functions and database connection logic (e.g., `mongodb.ts`, `auth.ts`).
- **`src/models/`**: Mongoose schemas for data modeling (User, Product, Category, etc.).
- **`src/styles/`**: Global styles and Tailwind configurations.
- **`public/`**: Static assets like images and fonts.

## Build, Test, and Development Commands

- **`npm run dev`**: Starts the development server with Next.js.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts the production server.
- **`npm run lint`**: Runs ESLint to check for code quality and style issues.

## Coding Style & Naming Conventions

- **TypeScript**: The project is written in TypeScript with strict mode enabled. Always use types/interfaces for props and state.
- **Next.js App Router**: Use server components by default and client components (`'use client'`) only when necessary.
- **Tailwind CSS**: Styling is handled via Tailwind. Stick to existing utility patterns for consistency.
- **ESLint**: Configured with `eslint-config-next` and TypeScript rules.
- **Imports**: Use the `@/` alias for absolute paths from the `src/` directory (e.g., `@/components/Button`).

## Commit & Pull Request Guidelines

- **Commit Messages**: Follow a conventional-ish format. Use descriptive prefixes like `feat:`, `fix:`, or `refactor:`. Examples:
    - `feat: connect shop page to MongoDB`
    - `fix: harden MongoDB connection for serverless runtime`
    - `refactor: code for improved readability in user management`
- **PRs**: Merge requests are typically grouped by feature or bug fix. Maintain clean and descriptive commit histories.

## Database Management

- **MongoDB**: The application uses Mongoose to interact with a MongoDB instance. The connection URI is stored in `.env.local` as `MONGODB_URI`.
- **Seeding**: Although defined in `package.json`, ensure the `scripts/seed.mjs` file exists or is correctly referenced before running `npm run seed`.
