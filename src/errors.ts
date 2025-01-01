import chalk from "chalk";

export class TerdoError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "TerdoError";
  }
}

export function handleError(error: unknown): never {
  if (error instanceof TerdoError) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }

  console.error(chalk.red("An unexpected error occurred:"), error);
  process.exit(1);
}
