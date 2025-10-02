# Contributing to Context Aggregation Agent

Thanks for your interest in contributing! This is a hackathon project and we welcome all contributions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/context-aggregation-agent.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes: `pnpm test`
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Code Style

- We use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features

## Project Structure

```
weaveagent/
├── packages/
│   ├── frontend/     # Next.js app
│   └── backend/      # Express API
├── docs/             # Documentation
└── README.md
```

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation as needed
- Add tests for new functionality
- Ensure all tests pass before submitting

## Questions?

Open an issue or reach out to the maintainers!

Happy hacking! 🚀
