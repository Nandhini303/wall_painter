# Normal User UI Design Summary & Flow Diagram

## 1. UI Design Summary (Normal User)

The "Normal User" experience in the **Smart Wall Paint Visualizer** is designed to be intuitive, focusing on core room design and collaboration without the clutter of administrative tools.

*   **Authentication Views (Login/Register):**
    *   Clean, minimalist forms with modern typography (Outfit / Inter) and material symbols.
    *   Clear error messaging and seamless transitions between sign-up and sign-in.
*   **User Dashboard:**
    *   **Project Grid:** A visually appealing card grid displaying thumbnail previews of the user's saved room visualization projects.
    *   **Quick Actions:** A prominent "Create New Project" floating action button (FAB) or dedicated card.
*   **Canvas Editor (Core Workspace):**
    *   **Interactive Canvas:** A large, infinite-zooming workspace powered by Konva.js for applying paint and textures to room images.
    *   **Heads-Up Display (HUD):** Non-intrusive floating toolbars for:
        *   Freehand drawing tools and brush sizes.
        *   Vector polygon masking (to isolate walls).
        *   Layer stack adjustment (managing multiple paint layers).
    *   **Catalog Panel:** An easily accessible side drawer or bottom sheet for browsing trending paint colors (e.g., Sage Green, Terracotta) and seamless wall textures.
*   **Real-time Collaboration Indicators:**
    *   Subtle UI elements (like avatars or toast notifications) showing when another designer joins the same canvas room, with immediate visual feedback of their drawing actions.

---

## 2. User Interaction Flow Diagram

This flowchart illustrates the step-by-step journey of a standard user interacting with the application.

```mermaid
flowchart TD
    %% Styling
    classDef page fill:#2d3436,stroke:#74b9ff,stroke-width:2px,color:#fff
    classDef action fill:#0984e3,stroke:#fff,stroke-width:1px,color:#fff
    classDef backend fill:#00b894,stroke:#fff,stroke-width:1px,color:#fff

    %% Flow
    Start([User Visits App]) --> Auth{Logged In?}
    
    Auth -->|No| Login[Login / Register Page]:::page
    Login -->|Submit Credentials| Auth
    
    Auth -->|Yes| Dashboard[User Dashboard]:::page
    
    Dashboard -->|Click 'Create New'| CreateAction[Initialize New Project]:::action
    Dashboard -->|Select Project Card| LoadAction[Load Saved Project]:::action
    
    CreateAction --> Canvas[Canvas Editor Workspace]:::page
    LoadAction --> Canvas
    
    Canvas --> EditorActions{Editor Tools}
    
    EditorActions -->|Open Catalog| SelectColor[Select Color / Texture]:::action
    SelectColor --> EditorActions
    
    EditorActions -->|Use Tools| Draw[Draw / Apply Vector Mask]:::action
    
    Draw --> LocalRender[Update Local Canvas]:::action
    LocalRender --> SocketEmit[Emit Changes via WebSockets]:::backend
    LocalRender --> AutoSave[Auto-save to Database]:::backend
    
    SocketEmit -.->|Broadcast| Peer[Other Active Users]:::page
```
