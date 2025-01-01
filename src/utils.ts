import type { Todo } from "./types";

export function generateAlias(todo: Todo): string {
  const cleanTitle = todo.title.replace(/[^a-zA-Z0-9]/g, "");
  const prefix = `${cleanTitle.slice(0, 3)}xxx`.slice(0, 3);
  const paddedId = todo.id.toString().padStart(2, "0");
  return `${prefix}${paddedId}`.toLowerCase();
}

export function formatDate(date: Date): string {
  const isToday = new Date().toDateString() === date.toDateString();
  return isToday
    ? `Today ${date.toLocaleTimeString("en-US", { timeStyle: "short" })}`
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export function showHelp(): void {
  console.log("\n📝 Terdo - Terminal Todo\n");
  console.log("Usage:");
  console.log("  terdo [options]\n");

  console.log("Options:");
  console.log("  -h, --help                Show help");
  console.log("  -a, --add <title>         Add a new todo");
  console.log("  -p, --priority <level>     Set priority (high, medium, low)");
  console.log("  -l, --list                List all todos");
  console.log("  -c, --complete <id>       Toggle todo completion");
  console.log("  -d, --delete <id>         Delete todo\n");

  console.log("Examples:");
  console.log('  terdo -a "Buy milk" -p high');
  console.log("  terdo -l");
  console.log("  terdo -c buy1             # Toggle completion");
  console.log("  terdo -c buy1 buy2        # Toggle multiple todos");
  console.log("  terdo -d buy1\n");

  console.log("Aliases:");
  console.log("  Each todo gets an alias made from its first 3 letters + ID");
  console.log("  Example: 'Buy milk' with ID 1 becomes 'buy1' or 'buy01'");
  console.log("  Both formats are accepted when using commands\n");

  console.log("Multiple Operations:");
  console.log(
    "  You can complete or delete multiple todos by repeating flags:",
  );
  console.log("  terdo -c buy01 -c tak02   # Complete multiple todos");
  console.log("  terdo -d buy01 -d tak02   # Delete multiple todos\n");

  process.exit(0);
}
