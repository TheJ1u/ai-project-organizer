# Contributing to OmniAI Hub

Thank you for your interest in contributing! Whether you are adding new AI connectors, improving prompts, reporting bugs, or enhancing documentation, your help is welcome.

## Quick Start

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/ai-project-organizer.git
   cd ai-project-organizer
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the local test suite**:
   ```bash
   npm test
   ```
5. **Start the local server**:
   ```bash
   npm start
   ```

## Development Guidelines

- Keep dependencies minimal (native Node.js modules preferred).
- All changes must pass `npm test` cleanly.
- If adding new API endpoints, write corresponding unit/integration tests in `test/test-endpoints.js`.
- Submit a Pull Request targeting the `main` branch with a clear description of your changes.
