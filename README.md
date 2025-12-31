# About 

An interactive digital canvas designed. Built with React, Fabric.js, and MobX.

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

## 🛠️ Technologies

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Fabric.js](https://img.shields.io/badge/Fabric.js-orange?style=for-the-badge)
![MobX](https://img.shields.io/badge/MobX-orange.svg?style=for-the-badge&logo=mobx&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PrimeReact](https://img.shields.io/badge/PrimeReact-blue?style=for-the-badge)

- **Core**: React 18, TypeScript, Vite
- **Canvas Engine**: Fabric.js 6
- **State Management**: MobX & MobX React Lite
- **Styling**: Tailwind CSS 4
- **Utilities**: UUID, React Router 7
- **Testing & Quality**: Vitest, ESLint, Prettier

## 📂 Project Structure

```text
src/
├── components/       # Shared UI components
├── context/          # React Contexts (e.g., Theme)
├── icons/            # SVG icons as React components
├── layouts/          # Page layouts
├── pages/
│   └── gameScene/    # Core canvas implementation
│       ├── modules/  # Feature-specific canvas logic (History, Tools, Layers, Zoom)
│       ├── store/    # MobX state stores
│       ├── hooks/    # Scene-specific React hooks
│       └── utils/    # Canvas-related utilities
├── routes/           # Application routing configuration
├── types/            # Global TypeScript definitions
└── utils/            # General purpose utilities
```

## 🏁 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Yarn or NPM

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/storyteller-scene.git
   cd storyteller-scene
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

### Available Scripts

- `yarn dev`: Starts the Vite development server.
- `yarn build`: Compiles the project for production.
- `yarn test`: Runs the test suite using Vitest.
- `yarn lint`: Checks code for linting issues.
- `yarn preview`: Previews the production build locally.

## 📄 License

This project is licensed under the MIT License - see the [package.json](package.json) file for details.
