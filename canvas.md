# SMART WALL PAINT VISUALIZER — CANVAS EDITOR SPECIFICATION (PHASE 1)

---

## 1. CANVAS ARCHITECTURE OVERVIEW

The Canvas Editor is the core component of the Smart Wall Paint Visualizer. It is built using **Konva.js** over HTML5 Canvas, providing an object-oriented rendering engine, infinite zoom/pan operations, and layer grouping.

### 1.1 Coordinates & Viewport Mechanics
The editor uses three coordinate spaces:
1. **Screen Coordinates**: Raw pixel positions relative to the browser viewport.
2. **Canvas / Local Coordinates**: Fixed coordinates relative to the base image dimensions.
3. **World Coordinates**: Transformed coordinates incorporating current zoom scale and pan offset.

#### Zoom & Pan Mathematics
Panning updates the translation offsets ($T_x, T_y$), while zooming updates scale factors ($S_x, S_y$).
The transformation matrix mapping local coordinate $(x, y)$ to screen position $(x', y')$ is:
$$x' = x \cdot S_x + T_x$$
$$y' = y \cdot S_y + T_y$$

To zoom into a specific focal point (e.g., the user's cursor position $(C_x, C_y)$) without displacement:
$$T_x' = C_x - (C_x - T_x) \cdot \frac{S_{new}}{S_{old}}$$
$$T_y' = C_y - (C_y - T_y) \cdot \frac{S_{new}}{S_{old}}$$

---

## 2. LAYERING SYSTEM & RENDERING PIECE

To apply paint realistically, we must retain the texture, highlights, and shadows of the original room image. The visualizer achieves this using a **Multi-Pass Layer Blend Stack**:

```
┌───────────────────────────────────────────────────────────┐
│ Layer 4: Interactive Overlays (Rulers, Snap Grid, Guides) │ [Opacity: 100%, Blend: Normal]
├───────────────────────────────────────────────────────────┤
│ Layer 3: Paint Mask Layer (User Drawings & Fills)         │ [Opacity: 85%, Blend: Multiply / Color Burn]
├───────────────────────────────────────────────────────────┤
│ Layer 2: Texture / Bump Map (Stucco, Gloss, Matte)        │ [Opacity: 40%, Blend: Soft Light]
├───────────────────────────────────────────────────────────┤
│ Layer 1: Base Image (Original Room Upload)                │ [Opacity: 100%, Blend: Normal]
└───────────────────────────────────────────────────────────┘
```

### Layer Types & Blending Modes
1. **Base Layer (Layer 1)**: The untouched user photo. Used as the backdrop.
2. **Texture Layer (Layer 2)**: Replicates wall textures. By using a monochrome bump map and `Soft Light` blending, the texture is visually mapped onto the underlying paint layer.
3. **Paint Mask Layer (Layer 3)**: Contains the custom polygon paths, brush strokes, and bucket fill regions. We use `Multiply` or `Color Burn` blending to overlay colors while preserving underlying shadows (dark areas darken the color, highlights shine through).
4. **Overlay Layer (Layer 4)**: Non-printing layer showing selection outlines, rulers, anchors, and snapping lines.

---

## 3. CORE INTERACTIVE CANVAS TOOLS

### 3.1 Flood Fill / Bucket Tool
Fills a contiguous region of matching color pixels using a Flood Fill algorithm.
- **Algorithm**: Queue-based 4-way flood fill.
- **Edge Detection Tolerance ($T$)**: Distance threshold in RGB space to determine wall boundaries:
  $$\Delta C = \sqrt{(R_1 - R_2)^2 + (G_1 - G_2)^2 + (B_1 - B_2)^2}$$
  If $\Delta C \le T$, the pixel is filled.
- **Smoothing / Anti-aliasing**: Apply a $3 \times 3$ Gaussian blur to the resulting mask edge to eliminate jagged borders.

### 3.2 Brush & Eraser Tools
Allows freehand painting or removal of masks.
- **Brush Properties**:
  - `Size`: Width of the drawing tip (in pixels).
  - `Hardness / Softness`: Radial gradient configuration. High softness shifts the outer radius opacity to 0 smoothly.
  - `Opacity`: Alpha transparency of the stroke.
- **Eraser**: Works similarly to the Brush tool but sets the mask channel alpha value back to 0.

### 3.3 Polygon Selection Tool
Allows precise wall delineation by clicking to place connected anchor points.
- **Path Closing**: Double-clicking or clicking the starting anchor closes the path and instantiates a closed vector polygon object.
- **Anchor Manipulation**: Interactive handles allow dragging points to refine the wall geometry post-creation.

---

## 4. HISTORY, STATE, AND EXPORTS

### 4.1 History Command Engine (Undo / Redo)
Implemented using the **Command Design Pattern**. The history stack stores action instances that implement `execute()` and `undo()` interfaces:

```typescript
interface Command {
  execute(): void;
  undo(): void;
  serialize(): string; // Return delta JSON
}
```

#### Memory Management
To optimize memory, instead of copying the entire canvas canvas buffer (which can be several Megabytes for high-res images) on each action, the system only stores vector coordinates (for Brushes/Polygons) or compressed run-length encoded (RLE) bitmasks (for Bucket Fills).

### 4.2 Measurement & Scale Calibration
- **Calibration Mode**: The user draws a line of known dimension (e.g., a doorframe labeled "2 meters").
- **Scale Factor**: Computes pixels-per-meter ($P_{pm}$):
  $$P_{pm} = \frac{\text{Line length in pixels}}{\text{Real-world length in meters}}$$
- **Feedback**: Dynamic labels overlaying polygon boundaries show real-world dimensions (e.g., "Wall Area: 12.4 m²").

### 4.3 Export Compilation pipeline
- **PNG / JPEG**: Merges all canvas layers down to a single base64 data stream.
- **SVG**: Translates vector polygons and brush paths into standard `<path>` tags, layered on top of the base image.
- **PDF**: Compiles a professional design report containing the room visual, thumbnail swatches of all used paint colors, manufacturer IDs, and surface area measurements.
