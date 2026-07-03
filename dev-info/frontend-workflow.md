# Frontend Workflow Architecture

This document maps out the core request lifecycle and how the frontend architecture handles routing, authentication, component injection, and rendering.

## Core Flow Diagram

```mermaid
graph TD
    %% Define Styles
    classDef entry fill:#1e1b4b,stroke:#a5b4fc,stroke-width:2px,color:#fff
    classDef router fill:#312e81,stroke:#c7d2fe,stroke-width:2px,color:#fff
    classDef guard fill:#7f1d1d,stroke:#fca5a5,stroke-width:2px,color:#fff
    classDef layout fill:#14532d,stroke:#86efac,stroke-width:2px,color:#fff
    classDef view fill:#0f766e,stroke:#5eead4,stroke-width:2px,color:#fff
    classDef component fill:#701a75,stroke:#f0abfc,stroke-width:2px,color:#fff
    classDef service fill:#9a3412,stroke:#fdba74,stroke-width:2px,color:#fff

    %% Flow Steps
    A[index.html] --> B[main.mjs<br/>App Bootstrapper]:::entry
    B --> C[app.mjs<br/>Global Listeners & Setup]:::entry
    C --> D[router/router.mjs<br/>Navigo Core Engine]:::router
    
    D --> E{router/routes.mjs<br/>Route Matching}:::router
    
    E -->|URL Matched| F[TokenService.mjs<br/>Check Auth & Expiration]:::service
    F -->|Authorized| G{RBAC Check<br/>Role Validation}:::guard
    F -->|Unauthorized| H[Redirect to /login]:::guard
    
    G -->|Denied| H
    G -->|Approved| I{Does Route<br/>Have a Layout?}:::router
    
    %% Layout Branches
    I -->|Yes: SuperAdminLayout| J[layouts/SuperAdminLayout.mjs]:::layout
    I -->|Yes: CenterLayout| K[layouts/CenterLayout.mjs]:::layout
    I -->|No: AuthLayout| L[layouts/AuthLayout.mjs]:::layout
    
    %% Component Injection
    J -->|Injects| M[components/Sidebar.mjs]:::component
    J -->|Injects| N[components/Navbar.mjs]:::component
    J -->|Mounts View| O[views/super-admin/DashboardView.mjs]:::view
    
    %% Data Flow
    O -.->|Requests Data| P[services/http.mjs<br/>Axios Interceptors]:::service
    P -.->|API Call| Q[(Backend API)]
    Q -.->|JSON Response| P
    P -.->|Updates State| O
    
    %% Shared Components
    O -->|Renders| R[components/Table.mjs]:::component
    O -->|Triggers| S[components/Toast.mjs]:::component
```

### Flow Breakdown:
1. **Entry Point:** The browser hits `index.html` which loads `main.mjs`. `main.mjs` imports `app.mjs` to initialize global events, and then triggers the router.
2. **Routing & Guards:** `router.mjs` intercepts the URL and checks `routes.mjs` for a match. It immediately calls `TokenService.mjs` to verify if the user is authenticated and has the correct role (`allowedRoles`).
3. **Layout Shell:** If the user is authorized, the Router dynamically loads the assigned `Layout` (e.g., `SuperAdminLayout.mjs`). The layout renders the `Sidebar` and `Navbar` components into the DOM.
4. **View Mounting:** The layout creates a container (`<main id="layout-content">`) and dynamically mounts the target `View` (e.g., `DashboardView.mjs`) inside of it.
5. **Data Fetching:** The View initiates an asynchronous API call through `http.mjs`. The `http` service automatically attaches the JWT token to the headers.
6. **UI Feedback:** While waiting for data, the View renders a Skeleton UI or triggers `Loader.mjs`. Upon success or failure, it uses `Toast.mjs` to notify the user.
7. **Rendering:** Finally, the View updates its DOM with the fetched data, often injecting reusable components like `Table.mjs`.

## Dynamic Form Engine Workflow

This workflow represents Phase 6 and dictates how forms are created, managed, and executed within the application.

```mermaid
graph TD
    classDef view fill:#0f766e,stroke:#5eead4,stroke-width:2px,color:#fff
    classDef service fill:#9a3412,stroke:#fdba74,stroke-width:2px,color:#fff
    classDef builder fill:#1e40af,stroke:#93c5fd,stroke-width:2px,color:#fff
    classDef store fill:#4c1d95,stroke:#c4b5fd,stroke-width:2px,color:#fff
    classDef renderer fill:#86198f,stroke:#f5d0fe,stroke-width:2px,color:#fff
    classDef rules fill:#b45309,stroke:#fcd34d,stroke-width:2px,color:#fff

    A[FormsView.mjs]:::view -->|Fetches Initial Data| B[form.service.mjs]:::service
    A -->|Instantiates| C[FormBuilder.mjs]:::builder
    
    C -->|Instantiates| D[SectionBuilder.mjs]:::builder
    C -->|Updates/Reads| E[formStore.mjs]:::store
    D -->|Updates| E
    
    E -.->|Notifies Subscriptions| C
    
    C -->|Preview Schema| F[FormRenderer.mjs]:::renderer
    F -->|Evaluates Logic| G[visibilityEngine.mjs]:::rules
    F -->|Validates Payload| H[validationEngine.mjs]:::rules
```

### Form Flow Breakdown:
1. **View Instantiation:** The user visits the forms page (`FormsView.mjs`), which fetches the existing form schemas from the backend using `form.service.mjs`.
2. **Builder Initialization:** Clicking "Edit Schema" loads the schema into the central state manager (`formStore.mjs`) and mounts `FormBuilder.mjs`.
3. **State Management & Editing:** `FormBuilder.mjs` orchestrates the UI, delegating question logic to `SectionBuilder.mjs`. Any interaction updates `formStore.mjs`, which utilizes a Pub/Sub pattern to trigger an immediate re-render of the Builder UI.
4. **Live Preview Rendering:** The builder can summon `FormRenderer.mjs` for a live preview. The renderer reads the exact JSON state from `formStore.mjs`.
5. **Rules Engine Evaluation:** As the user interacts with the rendered form, `FormRenderer.mjs` continuously invokes `visibilityEngine.mjs` to conditionally hide/show questions, and utilizes `validationEngine.mjs` to strictly validate the final payload payload before submission.
