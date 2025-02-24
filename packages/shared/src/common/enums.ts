export enum Header {
  Authorization = "authorization",
  Client = "client",
  ContentType = "Content-Type",
  Accept = "Accept",
  MobileVersion = "mobile_version",
  MobileBuild = "mobile_build",
  Source = "x-trpc-source",
}

export enum Case {
  LowerCase = "lowercase",
  CamelCase = "camelCase",
  PascalCase = "PascalCase",
  SnakeCase = "snake_case",
  KebabCase = "kebab-case",
  TitleCase = "Title Case",
  TrainCase = "TRAIN-CASE",
  ScreamingSnakeCase = "SCREAMING_SNAKE_CASE",
  SentenceCase = "Sentence case",
  UnknownCase = "Unknown case",
}
