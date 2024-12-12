---
options:
  implicit_slide_ends: true
---
TanStack Start: The Next Full-stack Framework
=============================================
![](./giphy.gif)

About me
========

![](profile.jpg)

- Sebastian Heitmann
- Currently building a startup
- 10+ years of experience in tech
- Software Developer gone Project Management

What's up?
========

1. Overview
2. Moin, Hamburg! (on paper)
3. Server Functions (hands on)
4. Recap & QA


Introduction into TanStack Start
================================

# Overview
- part of the TanStack
- comprehensive solution for building server-rendered **React** applications.
- It leverages the capabilities of TanStack Router for robust routing.
- strong emphasis on route type safety
- *Currently in BETA*


# Features
- Unified API for SSR, streaming, and hydration
- Full-stack type safety
- Bundling

Introduction into TanStack Start
===============

# What we build to today:

## Moin, Hamburg!
- Project initialisation
- TanStack Start installation
- Project scaffolding

## A counting app with Server Functions
- read the count from the server
- update the count on the server

Moin, Hamburg!
===============
# Project initialisation

## Project setup

```bash
# project root
pnpm init
```

## TypeScript config

```javascript
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2022",
    "skipLibCheck": true,
    "strictNullChecks": true
  }
}
```

Moin, Hamburg!
===============
# TanStack Start installation

```bash
pnpm add @tanstack/start @tanstack/react-router vinxi
```

# React and vite installation

```bash
pnpm add react react-dom
pnpm add -D vite @vitejs/plugin-react
```

# TypeScript installation

```bash
pnpm add -D typescript @types/react @types/react-dom
```

Moin, Hamburg!
===============

# Update package.json

```javascript
// package.json
{
  // ...
  "type": "module",
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start"
  }
}
```

# Create app.config.ts for vinxi

```typescript
// app.config.ts
import { defineConfig } from '@tanstack/start/config'

export default defineConfig({})
```

Moin, Hamburg!
===============

# Project scaffolding

We need to create files for:
- the router configuration
- the server entry point
- the client entry point
- the root of the application

The project is going to like like this

```bash
.
├── app/
│   ├── routes/
│   │   └── `__root.tsx`
│   ├── `client.tsx`
│   ├── `router.tsx`
│   ├── `routeTree.gen.ts` # <-- auto generated
│   └── `ssr.tsx`
├── `.gitignore` # when using git
├── `app.config.ts`
├── `package.json`
└── `tsconfig.json`
```

Moin, Hamburg!
===============

# Project scaffolding > Router Configuration

This file will define the behavior of `TanStack Router`.

```typescript
// app/router.tsx
import { 
  createRouter as createTanStackRouter 
} from '@tanstack/react-router'

// this will be generated later
import { routeTree } from './routeTree.gen' 

// creating the router based on the routeTree
export function createRouter() {
  const router = createTanStackRouter({ routeTree })
  return router
}

// augmenting the `react-router` module
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```

Moin, Hamburg!
===============

# Project scaffolding > Server Entry Point

We need to pipe the router information to the server entry point.

```typescript
//app/ssr.tsx
/// <reference types="vinxi/types/server" />
import {
  createStartHandler,
  defaultStreamHandler
} from '@tanstack/start/server'

import {
  getRouterManifest
} from '@tanstack/start/router-manifest'

import { createRouter } from './router'

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
```

Getting Started
===============

# Project scaffolding > Client Entry Point

Hydrating the client-side is achieved by passing the router information to the client Entry point.

```typescript
// app/client.tsx
/// <reference types="vinxi/types/client" />

import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/start'
import { createRouter } from './router'

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
```

Getting Started
===============

# Project scaffolding > Root

The Root will wrap all other routes in our app.

- define the root document
- define the root component
- define the root route

Getting Started
===============

# Project scaffolding > Root > root document

```typescript
// app/routes/__route.tsx

//... 
function RootDocument(
    { children }: Readonly<{ children: ReactNode }>
) {
  return (
    <html>
      <head>
        {/* injection of the route meta*/}
        <Meta /> 
      </head>
      <body>
        {children}
        {/* 
            keeps track of the scroll position
            when moving through history
        */}
        <ScrollRestoration /> 
        {/* injection of scripts */}
        <Scripts />
      </body>
    </html>
  )
}
```

Getting Started
===============

# Project scaffolding > Root > root component

```typescript
// app/routes/__route.tsx

//...

function RootComponent() {
  return (
    <RootDocument>
      <h1>Moin, Hamburg!</h1>
      {/* rendering of the child routes */}
      <Outlet />
    </RootDocument>
  )
}

//...
```

Getting Started
===============

# Project scaffolding > Root > route

```typescript
//app/routes/__route.tsx

//...
// using createRootRoute to define the
// root route to render the RootComponent
// and defining the head
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
  }),
  component: RootComponent,
})

//...

```

Getting Started
===============

# Project scaffolding > root > imports
```typescript
// app/routes/__root.tsx
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'
import type { ReactNode } from 'react'

//...
```

🤯🤯🤯
======

```bash
Warning: A notFoundError was encountered on the route with ID "__root__", but a notFoundComponent option was not configured, nor was a router level defaultNotFoundComponent configured. Consider configuring at least one of these to avoid TanStack Router's overly generic defaultNotFoundComponent (<div>Not Found<div>)
```

# The application root vs. the root route

- the entry points are defined
- the application root is defined
- the component rendered on the `'/'` route is undefined

We fix this in the next section.

Server Functions
================

# Reading and writing to a file

## Reading from the file

```typescript
// app/routes/index.tsx
import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'

const filePath = 'count.txt'

// read from file or return '0' on error
async function readCount() {
  return parseInt(
    await fs.promises
        .readFile(filePath, 'utf-8')
        .catch(() => '0'),
  )
}

//...
```

Server Functions
================

# Implementing the server functions
```typescript
// Server Functions are built on HTTP Requests but not exposed via http

const getCount = createServerFn({
  method: 'GET',
}).handler(() => {
  return readCount()
})

// the validator function is a glimpse into
// how middleware is handled
const updateCount = createServerFn(
    { method: 'POST' }
  )
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.promises
      .writeFile(filePath, `${count + data}`)
  })

//...
```

Server Functions
================

```typescript
// defining the route for '/'
export const Route = createFileRoute('/')({
  component: Home,
  // we load this data when the route is hit
  loader: async () => await getCount(),
})

function Home() {
  const router = useRouter()
  const state = Route.useLoaderData()

  return (
    <button
      type="button"
      onClick={() => {
        updateCount({ data: 1 }).then(() => {
          // invalidating the router to
          // refresh the state
          router.invalidate()
        })
      }}
    >
      Add 1 to {state}?
    </button>
  )
}
```

Recap
=====

# My first impressions

|   pros    |   cons    |
|-----------|-----------|
| non-magical | not beginner friendly |
| type safety  | verbosity |
| good documentation | but confusing from time to time |
| convenient server sunctions | niche? |
| convenient middleware integration |  |

# Use Cases
|   use for |   don't use for   |
|-----------|-------------------|
| Rich Interactivity | minor to none interactivity |
|SSR & Hydration | RSCs (WiP) |
| | 100% static generation |

# Overall

![](joy.gif)

Thank you!
==========

![](thanks.gif)

# Questions?

*Keep in Touch!*

- me@sebastian-heitmann.dev
- https://www.linkedin.com/in/sebastian-heitmann/
- https://x.com/e2e_developer
