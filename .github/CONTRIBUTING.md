# Contributing Guide

## Development Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. The pre-commit hooks will be automatically set up via Husky.

## Code Quality Tools

### Linting

We use ESLint with TypeScript support:

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Formatting

We use Prettier for code formatting:

```bash
# Check formatting
npm run format:check

# Auto-format code
npm run format
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Testing

We use Vitest for testing:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build the package
npm run build
```

## Git Workflow

### Commit Messages

This project enforces semantic commit messages using commitlint. All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

#### Commit Message Format

```
<type>: <subject>

[optional body]

[optional footer]
```

#### Allowed Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (white-space, formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

#### Examples

Good commit messages:

```
feat: add theme generator utility
fix: resolve circular reference in token resolution
docs: update API documentation
test: add contrast validation tests
```

Bad commit messages:

```
Update files
Fixed bug
WIP
```

### Pre-commit Hooks

When you commit, the following checks will run automatically:

1. **Lint-staged**: Runs ESLint and Prettier on staged files
2. **Commitlint**: Validates commit message format

If any check fails, the commit will be aborted. Fix the issues and try again.

### Pull Requests

1. Create a feature branch from `main` or `develop`
2. Make your changes following the code quality guidelines
3. Ensure all tests pass: `npm test`
4. Ensure the build works: `npm run build`
5. Push your branch and create a pull request
6. Wait for CI checks to pass

## CI Pipeline

Our GitHub Actions CI pipeline runs on every push and pull request:

1. **Lint Job**: Checks code formatting, linting, and type checking
2. **Test Job**: Runs the test suite
3. **Build Job**: Builds the package and verifies artifacts

All jobs must pass before a PR can be merged.

## Project Structure

```
design-tokens/
├── src/
│   ├── build/          # Build system
│   │   ├── generators/ # CSS/Tailwind generators
│   │   └── utils/      # Build utilities
│   ├── tokens/         # Token definitions
│   │   ├── core/       # Core tokens
│   │   └── semantic/   # Semantic tokens
│   └── themes/         # Theme definitions
├── tests/              # Test files
└── dist/               # Built output (generated)
```

## Questions?

If you have questions about contributing, please open an issue.
