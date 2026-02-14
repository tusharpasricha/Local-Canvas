# React TypeScript Whiteboard App

A feature-rich, canvas-based whiteboard application built with React, TypeScript, and Rough.js for a hand-drawn aesthetic.

## Features

### Drawing Tools
- **Select Tool**: Select and move shapes around the canvas
- **Pen Tool**: Freehand drawing with smooth curves
- **Rectangle Tool**: Draw rectangles with hand-drawn style
- **Circle Tool**: Draw circles with hand-drawn style
- **Line Tool**: Draw straight lines
- **Arrow Tool**: Draw arrows with arrowheads
- **Text Tool**: Add text with customizable font size

### Canvas Features
- **Undo/Redo**: Full history management with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- **Auto-save**: Automatically saves your work to localStorage
- **Shape Selection**: Click to select shapes, drag to move them
- **Customizable Styling**: Adjust stroke color, fill color, stroke width, and roughness

### Export/Import Options
- **PNG Export**: Export your drawing as a high-quality PNG image
- **SVG Export**: Export as scalable vector graphics
- **JSON Export**: Export the complete drawing data for backup
- **JSON Import**: Import previously saved drawings

### Keyboard Shortcuts
- `V` - Select tool
- `P` - Pen tool
- `R` - Rectangle tool
- `C` - Circle tool
- `L` - Line tool
- `A` - Arrow tool
- `T` - Text tool
- `Ctrl+Z` - Undo
- `Ctrl+Y` or `Ctrl+Shift+Z` - Redo

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whiteboard-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Rough.js** - Hand-drawn style graphics library
- **Tailwind CSS** - Utility-first CSS framework
- **HTML5 Canvas** - Drawing surface

## Project Structure

```
src/
├── components/          # React components
│   ├── Canvas.tsx      # Main drawing canvas
│   ├── Toolbar.tsx     # Tool selection and controls
│   └── ExportMenu.tsx  # Export options dropdown
├── hooks/              # Custom React hooks
│   ├── useCanvas.ts    # Canvas state management
│   └── useHistory.ts   # Undo/redo functionality
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
│   ├── drawUtils.ts    # Drawing and rendering utilities
│   ├── shapeUtils.ts   # Shape manipulation utilities
│   ├── storageUtils.ts # localStorage utilities
│   └── exportUtils.ts  # Export/import functionality
└── App.tsx             # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
