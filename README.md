# Immersive Five-Page Digital Experience

An extraordinary, award-winning interactive website featuring five completely unique immersive environments that seamlessly flow into one another through sophisticated animations and transitions.

## The Five Worlds

### 🌌 **Page One: The Drone Constellation**
A nighttime environment inspired by synchronized drone shows. Hundreds of intelligent, coordinated drones form dynamic aerial formations that respond to cursor movement and scrolling.

**Interactions:**
- Mouse movement changes viewing angle
- Cursor interaction repels nearby drones
- Scrolling evolves formations

**Visual Features:**
- Procedurally generated 3D formations
- Light bloom and atmospheric haze
- Smooth lens effects

---

### ✨ **Page Two: The Living Glitter Field**
A surreal field of millions of reflective particles that behave like metallic dust, responding to cursor and scroll interactions with sophisticated physics.

**Interactions:**
- Cursor creates gravitational pull on particles
- Click generates soft glitter shockwaves
- Mouse drag creates turbulent currents
- Scroll causes particles to drift upward

**Visual Features:**
- 10,000+ reflective particles
- Wind and gravity physics simulation
- Iridescent color palettes

---

### 🌀 **Page Three: Magnetic Black Liquid**
An experimental environment inspired by ferrofluid and liquid metal, featuring a reflective surface that responds to cursor position like a magnetic field.

**Interactions:**
- Cursor acts as a movable magnet
- Nearby liquid rises toward it
- Click reverses magnetic force
- Drag creates ridges and spikes
- Scroll increases magnetic intensity

**Visual Features:**
- Vertex deformation shader effects
- Mirror-like reflections
- Electric highlights and ripples

---

### 🌿 **Page Four: Bioluminescent Thread Forest**
A dreamlike environment of thousands of flexible glowing strands that sway in waves, responding to cursor proximity and creating a sense of walking through a living light forest.

**Interactions:**
- Cursor interaction pushes strands aside
- Click sends pulses through the network
- Scroll moves camera deeper into forest
- Touch dragging creates currents
- Periodic light waves travel through strands

**Visual Features:**
- 200+ animated strands with 30-40 points each
- Multi-colored glow effects
- Organic wave animations
- Depth fog and particle effects

---

### 🏛️ **Page Five: The Glass Observatory**
A final serene environment with floating glass architecture elements, rotating platforms, rings, and lenses suspended in space. A monument to the journey through all four previous worlds.

**Interactions:**
- Mouse movement influences reflections
- Hovering reveals hidden text
- Click central object to reconstruct elements from all five pages
- Scroll end triggers final cinematic sequence
- Elegant loop back to beginning

**Visual Features:**
- Floating architectural elements
- Pulsating glow effects
- Rotating glass structures
- Ambient lighting with multiple light sources
- Cinematic camera positioning

---

## Navigation & Controls

### Keyboard Shortcuts
- **`↑ ↓` or `← →`** - Navigate between worlds
- **`Scroll Wheel`** - Advance to next world
- **`F`** - Toggle fullscreen mode
- **`P`** - Show/hide FPS performance monitor
- **`?` (in help panel)** - View complete navigation guide
- **`M`** - Mute/unmute audio (if enabled)

### Mouse Interactions
- **Mouse Movement** - Interactive cursor effects (varies by page)
- **Click** - Page-specific interactions and formations
- **Drag** - Create currents and disturbances

### Navigation UI
- **Bottom Dots** - Jump to specific world (1-5)
- **Help Button** (Bottom Right, `?`) - View tips and shortcuts
- **Sound Control** (Top Left) - Toggle audio
- **Fullscreen** (Top Right) - Enter immersive fullscreen mode

### Mobile
- **Swipe Up/Down** - Navigate between pages
- **Touch Drag** - Interactive cursor effects
- **Tap** - Page-specific interactions
- **Navigation Dots** - Jump to specific world

---

## Technical Stack

- **Next.js 16** - React framework with Turbopack
- **React Three Fiber** - 3D graphics with Three.js
- **Framer Motion** - Smooth transitions and animations
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Responsive styling
- **Zustand** - Lightweight state management

---

## Installation & Running

### Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

The dev server supports hot reloading - changes update instantly.

### Features Included

✅ **Five Unique Interactive Scenes**
✅ **Smooth Page Transitions**
✅ **Sophisticated Cursor Interactions**
✅ **Responsive Mobile Design**
✅ **Keyboard Navigation**
✅ **Touch/Swipe Navigation**
✅ **Accessibility Features**
- Reduced Motion Support
- Keyboard Navigation
- Screen Reader Friendly
- High Contrast Text
✅ **Sound Controller** (disabled by default)
✅ **Performance Optimized**
- Instanced rendering for particles
- Dynamic quality reduction on low-end devices
- Lazy loading for scene components
- Efficient animation frames
- Real-time FPS monitoring

✅ **Enhanced UI & Feedback**
- Animated loading screen with progress bar
- Cinematic page transitions with particle effects
- Fullscreen mode (Press F)
- Interactive help panel with navigation guide
- Performance monitor (Press P)
- Light streaks during scene changes

---

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 5+)

Requires WebGL 2.0 support. Falls back to basic rendering on unsupported devices.

---

## Performance Notes

The experience is optimized for smooth 60fps performance:
- 200+ animated drones
- 10,000+ reflective particles
- 6,000+ line segments in thread forest
- Multiple real-time shader effects
- GPU-accelerated rendering

Target minimum specs:
- 4GB RAM
- Modern GPU
- High-speed internet connection

---

## Accessibility

- Full keyboard navigation
- Respects `prefers-reduced-motion` system setting
- ARIA labels for all interactive elements
- Color-independent design
- Text contrast ratios exceed WCAG AAA standards

---

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page component
│   └── globals.css         # Global styles
├── components/
│   ├── ExperienceShell.tsx  # Main experience container
│   ├── SceneNavigation.tsx  # Navigation UI
│   ├── SoundController.tsx  # Audio controls
│   └── scenes/             # Five scene components
│       ├── DroneConstellationScene.tsx
│       ├── GlitterFieldScene.tsx
│       ├── FerrofluidScene.tsx
│       ├── ThreadForestScene.tsx
│       └── GlassObservatoryScene.tsx
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── store.ts            # Zustand state management
├── hooks/
│   └── useCursorPosition.ts # Cursor position tracking hook
└── public/                  # Static assets
```

---

## Development Notes

### Scene Creation
Each scene is built as an independent React component that:
1. Manages its own state and animations
2. Responds to cursor position and scrolling
3. Implements Three.js/Framer Motion rendering
4. Includes accessibility labels

### Customization
- Scene content lives in `/components/scenes/`
- Global styles in `app/globals.css`
- Configuration constants at top of scene files
- Colors and materials are easily adjustable

### Adding New Features
1. Create new scene component following existing patterns
2. Add to `SCENES` array in `ExperienceShell.tsx`
3. Update `SCENE_CONFIGS` in `lib/types.ts`
4. Import and test

---

## License

This project is part of a custom interactive website experience.

---

## Credits

Created with Next.js, React Three Fiber, and Framer Motion.

Inspired by experimental web design, digital art installations, and futuristic UI concepts.
