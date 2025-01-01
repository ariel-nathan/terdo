import { parseArgs } from "node:util";
import {
  deleteTodo,
  listTodos,
  toggleTodos,
  validatePriority,
} from "./commands";
import { db } from "./db";
import { TerdoError, handleError } from "./errors";
import { showHelp } from "./utils";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
    add: {
      type: "string",
      short: "a",
    },
    priority: {
      type: "string",
      short: "p",
    },
    list: {
      type: "boolean",
      short: "l",
    },
    delete: {
      type: "string",
      short: "d",
      multiple: true,
    },
    complete: {
      type: "string",
      short: "c",
      multiple: true,
    },
  },
  strict: true,
  allowPositionals: true,
});

// Show help if no arguments or help flag
if (Object.keys(values).length === 0 || values.help) {
  showHelp();
}

try {
  // Handle commands
  if (values.priority && !values.add) {
    throw new TerdoError(
      "Priority flag (-p) must be used with add flag (-a)",
      "INVALID_USAGE",
    );
  }

  if (values.add) {
    const priority = validatePriority(values.priority);
    db.addTodo(values.add, priority);
    listTodos();
  }

  if (values.list) {
    listTodos();
  }

  if (values.delete) {
    deleteTodo(values.delete);
    listTodos();
  }

  if (values.complete) {
    toggleTodos(values.complete);
    listTodos();
  }
} catch (error) {
  handleError(error);
}
