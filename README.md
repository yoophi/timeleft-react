# Timeleft (React)

> **Don't waste your time.**

This is a React port of the original [Timeleft](https://github.com/aoueon/timeleft) application. It helps you visualize the passing of time across various timeframes (Hour, Day, Week, Year, etc.) to encourage productivity and time awareness.

## Features

- **Visual Dashboard**: Displays circular progress bars for different time units.
- **Detailed Specs**: Shows precise remaining time in milliseconds, seconds, minutes, etc.
- **Single View**: Click any card to focus on that specific timeframe (URL updates with hash).
- **Responsive Design**: Adapts to Mobile, Tablet, and Desktop screens.
- **Dynamic Theming**: Cards change color based on their urgency (blue to red).

## Tech Stack

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router](https://reactrouter.com/) (HashRouter)
- **Styling**: Vanilla CSS (Ported from original)
- **Code Formatting**: [Prettier](https://prettier.io/)

## Project Structure

```bash
src/
├── components/
│   ├── TimeCard.tsx       # Individual time unit card component
│   └── TimeGrid.tsx       # Main grid layout and navigation logic
├── hooks/
│   └── useTimeLeft.ts     # Core logic for time calculation (Custom Hook)
├── styles/
│   └── global.css         # Global styles and media queries
├── App.tsx                # Main Router configuration
└── main.tsx               # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)

### Installation

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

### Build

To create a production build:

```bash
npm run build
```

### Deployment

To deploy to GitHub Pages:

```bash
npm run deploy
```

## License

Based on the original [Timeleft](https://github.com/aoueon/timeleft) by Raoul Simionas.
