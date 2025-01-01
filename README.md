# terdo

A fast and simple terminal-based todo manager built with Bun and SQLite.

## Features

- 📝 Quick todo creation with priority levels
- ✨ Simple alias system for easy todo management
- 🎯 Priority-based sorting (high, medium, low)
- ✅ Toggle todo completion
- 🗑️ Delete todos
- 📋 List all todos with status and timestamps

## Installation

To install dependencies:

```bash
bun install
```

## Usage

```bash
# Add a new todo with priority
terdo -a "Buy milk" -p high

# List all todos
terdo -l

# Toggle todo completion (using alias)
terdo -c buy01

# Delete a todo
terdo -d buy01

# Show help
terdo -h
```

## Development

To run the development version:

```bash
bun run src/index.ts
```

To build the executable:

```bash
bun run build
```

## License

MIT License - see [LICENSE](LICENSE) file for details.