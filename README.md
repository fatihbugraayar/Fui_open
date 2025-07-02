# 🎨 Fui Designer - Professional Design Tool

Fui Designer is a modern, web-based design tool inspired by Figma, built with Vue.js and TypeScript. It features a comprehensive workspace system for creating and managing design projects.

## ✨ Features

### 🚀 Project Management
- **Welcome Screen**: Choose from templates or create custom projects
- **Template Gallery**: Pre-made templates for common design formats
- **Custom Projects**: Define your own canvas dimensions and settings
- **Recent Projects**: Quick access to your latest work

### 🏗️ Workspace System
- **Main Workspace**: Primary design area for your project
- **Additional Workspaces**: Create multiple workspaces within a project
- **Workspace Tabs**: Easy navigation between different workspaces
- **Workspace Management**: Add, delete, and organize workspaces

### 🎯 Design Tools
- **Selection Tool**: Select and manipulate objects
- **Move Tool**: Drag and reposition elements
- **Shape Tools**: Rectangle, Circle, and more
- **Text Tool**: Add and edit text elements
- **Transform Tool**: Resize and rotate objects

### 📑 Layer Management
- **Workspace-Based Layers**: Each workspace has its own layer system
- **Layer Panel**: Hierarchical view of all layers
- **Layer Controls**: Show/hide, lock/unlock, duplicate, delete
- **Layer Preview**: Visual indicators for different layer types

### 🎨 Properties Panel
- **Dynamic Properties**: Context-sensitive property editing
- **Color Picker**: Stroke and fill color controls
- **Typography**: Font size, family, and text properties
- **Transform**: Position, size, and rotation controls

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3 + TypeScript + Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Canvas**: Konva.js (for advanced canvas operations)
- **Backend**: Python Flask (for project persistence)

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProjectStartScreen.vue      # Welcome screen with templates
│   │   ├── TopBar.vue                  # Main navigation bar
│   │   ├── ToolPanel.vue               # Left toolbar with design tools
│   │   ├── DesignCanvas.vue            # Main canvas area
│   │   ├── WorkspaceLayerPanel.vue     # Workspace tabs + Layer management
│   │   └── PropertiesPanel.vue         # Right properties panel
│   ├── stores/
│   │   └── project.ts                  # Pinia store for project state
│   ├── types/
│   │   └── project.ts                  # TypeScript interfaces
│   └── App.vue                         # Main application component
backend/
├── app.py                              # Flask API server
├── models.py                           # Database models
└── requirements.txt                    # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Fui
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python app.py
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎯 How to Use

### Creating a New Project

1. **Welcome Screen**: When you first open Fui Designer, you'll see the welcome screen
2. **Choose Template**: Select from pre-made templates like:
   - Mobile App (390×844px)
   - Web Desktop (1440×1024px)
   - Tablet (820×1180px)
   - Social Media Post (1080×1080px)
   - Presentation (1920×1080px)
   - Business Card (350×200px)
3. **Custom Project**: Or create a custom project with your own dimensions
4. **Start Designing**: Click to create and start designing!

### Working with Workspaces

1. **Main Workspace**: Every project starts with a main workspace
2. **Add Workspace**: Click the "+" button in the workspace tabs
3. **Switch Workspaces**: Click on workspace tabs to switch between them
4. **Manage Workspaces**: Each workspace has its own layers and properties

### Using Design Tools

1. **Select Tool (V)**: Default tool for selecting and moving objects
2. **Move Tool (M)**: Dedicated tool for positioning elements
3. **Rectangle Tool (R)**: Create rectangular shapes
4. **Circle Tool (C)**: Create circular shapes
5. **Text Tool (T)**: Add text elements

### Managing Layers

1. **Layer Panel**: All layers are shown in the right panel
2. **Workspace Context**: Layers are organized by workspace
3. **Layer Actions**:
   - Click to select a layer
   - Eye icon to show/hide
   - Duplicate icon to copy
   - Trash icon to delete

### Editing Properties

1. **Select an Object**: Click on any element in the canvas
2. **Properties Panel**: The right panel shows editable properties
3. **Color Controls**: Use the color pickers in the left toolbar
4. **Transform**: Adjust position, size, and rotation

## 🔧 Development

### Project Architecture

The application follows a clean architecture with:

- **Component-Based UI**: Each major UI area is a separate Vue component
- **Centralized State**: Pinia store manages all application state
- **Type Safety**: Full TypeScript implementation with proper interfaces
- **Workspace System**: Each workspace is independent with its own layers
- **Backward Compatibility**: Frame system maintained for legacy support

### Key Components

- **ProjectStartScreen**: Handles project creation and template selection
- **WorkspaceLayerPanel**: Manages workspace tabs and layer organization
- **DesignCanvas**: Main canvas area with zoom and pan capabilities
- **ToolPanel**: Left sidebar with design tools
- **PropertiesPanel**: Right sidebar for object properties

### State Management

The Pinia store (`stores/project.ts`) manages:
- Project metadata and settings
- Workspace collection and selection
- Layer hierarchy and properties
- Tool states and UI preferences

## 🌟 Features in Detail

### Template System
- Pre-configured project templates for common use cases
- Custom dimension support for any project size
- Background color and initial settings per template

### Workspace Management
- Multiple workspaces per project
- Main workspace designation
- Independent layer systems per workspace
- Workspace-specific properties and settings

### Layer System
- Type-based layers (rectangle, circle, text, etc.)
- Workspace association for proper organization
- Visibility and lock states
- Hierarchical layer ordering

### Tool System
- Context-sensitive tool behavior
- Keyboard shortcuts support
- Visual tool state indicators
- Property binding to selected tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Figma's excellent design tool interface
- Built with the amazing Vue.js ecosystem
- Uses Tailwind CSS for beautiful, responsive styling
