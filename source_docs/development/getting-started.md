# Getting Started

Project setup and development environment configuration for Reaction v2.

## Prerequisites

### Required Software
- **Node.js**: Latest LTS version recommended
- **npm**: Comes with Node.js installation
- **WebGPU-compatible browser**: Chrome 113+, Firefox 113+, or Safari Technology Preview

### Hardware Requirements
- **GPU**: WebGPU-compatible graphics card
- **Memory**: 8GB+ RAM recommended for development
- **Storage**: 2GB+ free space for dependencies and build artifacts

## Initial Setup

### 1. Project Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
This starts the development server with hot reload and debugging enabled.

### 3. Verify Setup
- Open browser to development server URL (usually http://localhost:5173)
- Check browser console for WebGPU support
- Verify no initial compilation errors

## Development Workflow

### Available Commands
```bash
npm run dev         # Development server with hot reload
npm run test        # Run test suite
npm run build       # Production build
npm run lint        # ESLint code checking  
npm run format      # Prettier code formatting
```

### File Structure Overview
```
.
├── src/                    # Source code
│   ├── core/              # Core Engine module
│   ├── spell-system/      # Spell System module  
│   ├── physics-engine/    # Physics Engine module
│   ├── reaction-engine/   # Reaction Engine module
│   ├── renderer/          # Renderer module
│   └── tools/            # Development tools
├── docs/                  # Documentation
├── tests/                 # Test files
└── package.json          # Project configuration
```

## Common Issues

### WebGPU Not Available
**Problem**: Browser doesn't support WebGPU
**Solution**: Use Chrome 113+, Firefox 113+, or enable experimental features

### Build Failures
**Problem**: TypeScript compilation errors
**Solution**: Run `npm run lint` and fix reported issues

### Performance Issues
**Problem**: Development server running slowly
**Solution**: Close other applications, check GPU drivers are updated

## Next Steps

1. **Read Architecture**: Start with [cross-reference:: [[overview|Architecture Overview]]]
2. **Explore Systems**: Browse individual system documentation
3. **Run Tests**: Verify everything works with `npm run test`
4. **Make Changes**: Try modifying code and see hot reload in action

## Development Environment

### Development Environment Setup
⚠️ **SUGGESTION**: Consider establishing:
- IDE configuration and recommended extensions
- WebGPU debugging extensions
- Performance profiling tools
- GPU shader debugging setup