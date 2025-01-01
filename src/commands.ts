import chalk from "chalk";
import { db } from "./db";
import { TerdoError } from "./errors";
import type { PriorityType } from "./types";
import { formatDate, generateAlias } from "./utils";

export function validatePriority(priority?: string): PriorityType {
  if (!priority) return "none";

  const normalizedPriority = priority.toLowerCase() as PriorityType;
  if (!["low", "medium", "high", "none"].includes(normalizedPriority)) {
    throw new TerdoError(
      "Priority must be low, medium, or high",
      "INVALID_PRIORITY",
    );
  }
  return normalizedPriority;
}

export function resolveTodoIdentifier(identifier: string): number {
  const query = db.prepare(`
    SELECT id FROM todos 
    WHERE id = ? 
    OR (
      LOWER(
        SUBSTR(
          REPLACE(title, '[^a-zA-Z0-9]', ''),
          1, 3
        ) || id
      ) = LOWER(?)
    )
    OR (
      LOWER(
        SUBSTR(
          REPLACE(title, '[^a-zA-Z0-9]', ''),
          1, 3
        ) || PRINTF('%02d', id)
      ) = LOWER(?)
    )
    LIMIT 1
  `);

  const result = query.get(
    Number.parseInt(identifier) || 0,
    identifier,
    identifier,
  ) as {
    id: number;
  } | null;

  if (!result) {
    throw new TerdoError(
      `Todo with identifier "${identifier}" not found`,
      "NOT_FOUND",
    );
  }

  return result.id;
}

export function deleteTodo(identifiers: string[]): void {
  db.transaction(() => {
    const ids = identifiers.map(resolveTodoIdentifier);
    const deleteTodo = db.prepare("DELETE FROM todos WHERE id = ?");

    for (const id of ids) {
      deleteTodo.run(id);
    }

    const message =
      ids.length === 1 ? "Todo deleted" : `${ids.length} todos deleted`;
    console.log(chalk.green(`🗑️  ${message}`));
  })();
}

export function toggleTodos(identifiers: string[]): void {
  db.transaction(() => {
    const updates: { id: number; wasComplete: boolean }[] = [];
    const checkTodo = db.prepare(
      "SELECT id, completed FROM todos WHERE id = ?",
    );

    const ids = identifiers.map((identifier) => {
      const id = resolveTodoIdentifier(identifier);
      const todo = checkTodo.get(id) as {
        id: number;
        completed: boolean;
      } | null;
      if (todo) {
        updates.push({ id: todo.id, wasComplete: !!todo.completed });
      }
      return id;
    });

    const toggleTodo = db.prepare(
      "UPDATE todos SET completed = NOT completed WHERE id = ?",
    );

    const results = {
      completed: 0,
      uncompleted: 0,
    };

    for (const { id, wasComplete } of updates) {
      toggleTodo.run(id);
      if (wasComplete) {
        results.uncompleted++;
      } else {
        results.completed++;
      }
    }

    const messages: string[] = [];
    if (results.completed > 0) {
      messages.push(
        `${results.completed} ${
          results.completed === 1 ? "todo" : "todos"
        } completed`,
      );
    }
    if (results.uncompleted > 0) {
      messages.push(
        `${results.uncompleted} ${
          results.uncompleted === 1 ? "todo" : "todos"
        } uncompleted`,
      );
    }

    console.log(chalk.green(`✓ ${messages.join(", ")}`));
  })();
}

export function listTodos(): void {
  const todos = db.getAllTodos();

  console.log("\n📋 Todo List:\n");

  if (todos.length === 0) {
    console.log(chalk.dim("  No todos yet. Add one with:"));
    console.log(chalk.dim('  terdo -a "Your todo" -p high\n'));
    return;
  }

  for (const todo of todos) {
    const status = todo.completed ? chalk.green("✓") : " ";
    const titleDisplay = todo.title.padEnd(30);
    const styledTitle = todo.completed
      ? chalk.strikethrough(titleDisplay)
      : titleDisplay;
    const alias = generateAlias(todo);
    const aliasDisplay = `[${chalk.dim(alias)}]`.padEnd(8);

    let priorityText = "";
    switch (todo.priority) {
      case 3: // HIGH
        priorityText = chalk.red("HIGH".padEnd(8));
        break;
      case 2: // MEDIUM
        priorityText = chalk.yellow("MEDIUM".padEnd(8));
        break;
      case 1: // LOW
        priorityText = chalk.blue("LOW".padEnd(8));
        break;
      default:
        priorityText = chalk.gray("NONE".padEnd(8));
        break;
    }

    const updated = new Date(todo.updated_at);
    const dateStr = formatDate(updated);

    console.log(
      `${status} ${aliasDisplay} ${styledTitle} ${priorityText} ${chalk.dim(
        dateStr,
      )}`,
    );
  }
  console.log();
}
