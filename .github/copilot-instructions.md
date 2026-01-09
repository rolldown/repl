# Rolldown REPL

Rolldown REPL is a Vue.js/Nuxt.js web application that provides an interactive playground for Rolldown, a JavaScript bundler. The application features a Monaco Editor-based code editor with real-time bundling and output display.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

Bootstrap, build, and test the repository:
- Install pnpm globally: `npm install -g pnpm`
- Install dependencies: `pnpm install` -- takes 40 seconds initially. NEVER CANCEL. Set timeout to 90+ seconds.
- Run development server: `pnpm run dev` -- takes 15 seconds to start. NEVER CANCEL. Set timeout to 60+ seconds.
- Build for production: `pnpm run build` -- takes 16 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Generate static site: `pnpm run generate` -- takes 14 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Run linting: `pnpm run lint` -- takes 5 seconds. Set timeout to 30+ seconds.
- Run type checking: `pnpm run typecheck` -- takes 7 seconds. Set timeout to 30+ seconds.
- Preview built application: `pnpm run preview` or `node .output/server/index.mjs`

## Technology Stack
- Vue.js 3.5.20 with Nuxt.js 4.0.3
- TypeScript 5.9.2
- Monaco Editor for code editing
- UnoCSS for styling  
- pnpm 10.15.0 (required - do not use npm or yarn)
- Node.js v20+ (LTS)
- Custom Vite build using rolldown-vite

## Development Server
- Start with: `pnpm run dev`
- Accessible at: http://localhost:3000
- Features hot module replacement
- **Network Dependencies**: Application attempts to load Rolldown modules from external CDN. In sandboxed environments, expect network errors but core UI functionality will still work.

## Build Process
- Production build: `pnpm run build` (outputs to `.output/`)
- Static generation: `pnpm run generate` (outputs to `.output/public/`)
- Preview build: `node .output/server/index.mjs`
- **Special Configuration**: Uses `vite: "npm:rolldown-vite@latest"` resolution for custom Vite build

## Validation
ALWAYS run through these validation scenarios after making changes:
1. **Installation Test**: Run `pnpm install` and verify no errors
2. **Build Test**: Run `pnpm run build` and ensure it completes without errors
3. **Development Test**: Start `pnpm run dev`, navigate to http://localhost:3000, verify:
   - Monaco Editor loads on the left side
   - Tab system works (index.ts, rolldown.config.ts)
   - Code can be typed in the editor
   - Right panel shows output (may show errors in sandboxed environment)
   - Dark mode toggle works
   - UI is responsive
4. **Code Quality**: Run `pnpm run lint` and `pnpm run typecheck` - both must pass
5. **Manual Testing**: Type code in the editor, verify syntax highlighting works

**CRITICAL**: NEVER CANCEL long-running builds. Build times are normal and expected.

## Project Structure
```
/app              - Main application code
  /components     - Vue components (Navbar, InputContainer, OutputContainer, CodeEditor, etc.)
  /composables    - Vue composables
  /styles         - CSS styles
  /utils          - Utility functions
  app.vue         - Main application layout
/server/api       - Nitro API routes
/public           - Static assets (rolldown-bracketless.svg, rolldown-dark.svg, rolldown-light.svg)
/patches          - pnpm patches (nuxt-monaco-editor.patch)
nuxt.config.ts    - Nuxt configuration
package.json      - Dependencies and scripts
eslint.config.js  - ESLint configuration (@sxzz/eslint-config)
tsconfig.json     - TypeScript configuration
uno.config.ts     - UnoCSS configuration
netlify.toml      - Netlify deployment config
```

## Key Files to Check When Making Changes
- Always check `app/app.vue` when modifying the main layout
- Check `nuxt.config.ts` when modifying build or module configuration  
- Check `app/components/` when modifying UI components
- Check `server/api/` when modifying API functionality
- Always run `pnpm run lint` and `pnpm run typecheck` before committing

## Common Tasks

### Adding Dependencies
```bash
# Add production dependency
pnpm add package-name

# Add development dependency  
pnpm add -D package-name
```

### Code Quality Checks
```bash
# Lint code
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix

# Type check
pnpm run typecheck
```

### Deployment
- **Netlify**: Configured in netlify.toml, builds with `pnpm run build`
- **Static**: Use `pnpm run generate` to create static site in `.output/public/`
- **Server**: Use `pnpm run build` to create server bundle in `.output/server/`

## Troubleshooting

### Network Errors in Development
- The application loads Rolldown modules from external CDN
- In sandboxed environments, expect "Failed to fetch" errors
- Core UI functionality (editor, tabs, styling) will still work
- This is expected behavior and does not indicate a broken build

### Build Issues
- Ensure using pnpm (not npm/yarn): `which pnpm`
- Clear cache: `rm -rf node_modules/.cache .nuxt`
- Reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

### Monaco Editor Issues
- Editor requires Cross-Origin headers (configured in nuxt.config.ts)
- Web workers may not function in some environments
- Syntax highlighting depends on Shiki integration

## Dependencies Information
The project uses several key dependencies:
- `@rolldown/browser`: The core Rolldown bundler for browser
- `monaco-editor`: Code editor component
- `@shikijs/monaco`: Syntax highlighting integration
- `nuxt-monaco-editor`: Nuxt module for Monaco Editor (patched version)
- `@vueuse/core`: Vue composition utilities
- `@unocss/nuxt`: Atomic CSS framework

## Expected Output Examples

### Successful pnpm install
```
Dependencies: +1102
Done in 38.7s using pnpm v10.15.0
```

### Successful build
```
✓ built in 7.76s
Client built in 7811ms
Server built in 692ms
```

### Successful dev start
```
➜ Local:    http://localhost:3000/
✓ Vite client built in 127ms
✓ Vite server built in 182ms
```