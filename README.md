# Time Weaver

Time Weaver is an interactive gamified application built with React and TypeScript designed to simulate and visualize energy consumption, comfort levels, and grid status over a timeline.

## Tech Stack

* **Framework:** [React](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
* **State/Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
* **Routing:** [React Router](https://reactrouter.com/)

## Project Structure

* `src/components/game`: Core game logic components (ComfortMeter, GridStatusGauge, HouseVisualization, etc.).
* `src/components/ui`: Reusable UI components from shadcn/ui.
* `src/pages`: Main application views (`Index.tsx`, `NotFound.tsx`).
* `src/data`: Static game data configuration.

## Setup & Installation

1.  **Install dependencies:**
    ```bash
    npm install
    # or
    bun install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    # or
    bun dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    ```

## Key Features

* **Comfort Meter:** Visualizes the user's current comfort level based on in-game actions.
* **Grid Status Gauge:** Displays real-time stress on the energy grid.
* **Timeline:** Allows users to weave through time intervals to manage consumption.
* **Responsive Design:** Optimized for mobile and desktop views using Tailwind CSS.
