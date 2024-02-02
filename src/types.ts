export type Logger = {
  debug: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
  error: (message: string) => void
}

export type Context = {
  logger: Logger
  githubToken: string
}
