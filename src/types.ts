type LoggerFunction = (message?: any, ...optionalParams: any[]) => void

export type Logger = {
  debug: LoggerFunction
  info: LoggerFunction
  warn: LoggerFunction
  error: LoggerFunction
}

export type Context = {
  logger: Logger
  githubToken: string
}
