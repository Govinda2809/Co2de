# CO2DE VS Code Extension 🚀⚡🧬

**CO2DE** (Code Environmental Impact Analyzer) brings real-time carbon telemetry directly into your IDE.

## Features

- **Leaf Status Bar**: High-fidelity CO2 estimation for the active document.
- **Protocol Audit**: Press `co2de.analyze` (Command Palette or click the leaf) to trigger an AST-layer complexity and carbon audit.
- **Architectural Telemetry**: Real-time updates as you type, tracking complexity O(N) and energy draw in kWh.

## How to use (Development)

1. Open this folder `extension/` in VS Code.
2. Press `F5` to open a new **Extension Development Host** window.
3. Open any source code file (`.js`, `.py`, `.ts`, etc.).
4. Look at the **Status Bar** (bottom right) for a leaf icon `(leaf) Xg CO2`.
5. Run the command `CO2DE: Analyze Current File` for a detailed report.

## FAQ

### Why doesn't it show the code "running"?

CO2DE is designed for **Sustainable Static Analysis**. Running code consumes significantly more energy than analyzing it. By providing **Real-time Telemetry**, we allow you to architect for efficiency _before_ a single watt is spent on execution.

---

_Part of the CO2DE Protocol Architecture._
