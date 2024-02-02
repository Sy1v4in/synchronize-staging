export type Logger = {
  debug: (message: string) => void
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}

export type Context = {
  logger: Logger
  githubToken: string
}
