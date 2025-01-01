import { Database } from "bun:sqlite";
import { Priority, type PriorityType, type Todo } from "./types";

export class TodoDB {
  private db: Database;

  constructor() {
    this.db = new Database("terdo.sqlite", { create: true, strict: true });
    this.initialize();
  }

  private initialize() {
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT(0),
          priority INTEGER NOT NULL DEFAULT(0),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);

      this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_updated_at
        AFTER UPDATE ON todos
        BEGIN
          UPDATE todos 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = NEW.id; 
        END;
      `);
    } catch (error) {
      console.error("Database initialization error:", error);
      process.exit(1);
    }
  }

  addTodo(title: string, priority: PriorityType): void {
    const insert = this.db.prepare(
      "INSERT INTO todos (title, priority) VALUES (?, ?)",
    );

    const priorityValue =
      {
        low: Priority.LOW,
        medium: Priority.MEDIUM,
        high: Priority.HIGH,
        none: Priority.NONE,
      }[priority] ?? Priority.NONE;

    try {
      insert.run(title, priorityValue);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  getAllTodos(): Todo[] {
    return this.db
      .query(
        `SELECT * FROM todos 
         ORDER BY 
           completed ASC,
           CASE 
             WHEN completed = 0 THEN priority
             ELSE 0
           END DESC,
           updated_at DESC`,
      )
      .all() as Todo[];
  }

  prepare(sql: string) {
    return this.db.prepare(sql);
  }

  transaction<T>(fn: () => T): () => T {
    return this.db.transaction(fn) as unknown as () => T;
  }
}

export const db = new TodoDB();
