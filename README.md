# 🎨 Fabric.js Editor

An interactive digital canvas designed and built using React, Fabric.js, and MobX.

## 🚀 Features

- **Interactive Canvas**: High-performance canvas with smooth panning and zooming (mouse wheel support).
- **Drawing Suite**:
  - **Pencil**: Freehand drawing.
  - **Shapes**: Quick placement of Rectangles and Circles.
  - **Arrows**: Direct attention with directional arrows.
  - **Customization**: Full control over stroke color, fill color, and stroke width.
- **Text Tool**: Add and position text elements easily.
- **Measurement Tool**: Built-in distance measurement for precise scene planning.
- **Scene History**: Robust Undo/Redo system (supports Ctrl+Z / Ctrl+Y or Ctrl+Shift+Z).
- **Asset Management**: Seamlessly upload and integrate images into your scene.
- **Layers Management**: Control object visibility, locking, and order.

## 🛠️ Technologies

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Fabric.js](https://img.shields.io/badge/Fabric.js-orange?style=for-the-badge)
![MobX](https://img.shields.io/badge/MobX-orange.svg?style=for-the-badge&logo=mobx&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PrimeReact](https://img.shields.io/badge/PrimeReact-blue?style=for-the-badge)

- **Core**: React 18, TypeScript, Vite 5
- **Canvas Engine**: Fabric.js 6
- **State Management**: MobX 6 & MobX React Lite 4
- **Styling**: Tailwind CSS 4, PrimeReact 10
- **Utilities**: UUID, React Router 7
- **Testing & Quality**: Vitest, ESLint 9, Prettier

## 📂 Project Structure

```text
src/
├── context/          # React Contexts (e.g., Theme)
├── icons/            # SVG icons as React components
├── layouts/          # Page layouts
├── pages/
│   └── editor/       # Core canvas implementation
│       ├── modules/  # Feature-specific canvas logic
│       │   ├── sceneCanvas       # Canvas initialization and resizing
│       │   ├── sceneHistory      # Undo/Redo state management
│       │   ├── sceneLayers       # Layer and object list management
│       │   ├── sceneTools        # Drawing and interaction tools
│       │   └── sceneZoomControls # Zoom and pan controls
│       ├── store/    # MobX state stores
│       ├── hooks/    # Scene-specific React hooks
│       └── utils/    # Canvas-related utilities
├── routes/           # Application routing configuration
```

## 🏁 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Yarn or NPM

### Installation

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the development server:
   ```bash
   yarn dev
   ```

### Available Scripts

- `yarn dev`: Starts the Vite development server.
- `yarn build`: Compiles the project for production.
- `yarn test`: Runs the test suite using Vitest.
- `yarn lint`: Checks code for linting issues.
- `yarn lintfix`: Automatically fixes linting issues.
- `yarn preview`: Previews the production build locally.

## 📄 License

This project is licensed under the MIT License - see the [package.json](package.json) file for details.
