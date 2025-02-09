export const UserRole = ["user", "editor", "admin"] as const;
export type UserRole = (typeof UserRole)[number];

export const UserStatus = ["active", "inactive"] as const;
export type UserStatus = (typeof UserStatus)[number];

export const RegionRole = ["user", "editor", "admin"] as const;
export type RegionRole = (typeof RegionRole)[number];

export enum EventTypes {
  Bootcamp = "Bootcamp",
  Run = "Run",
  Ruck = "Ruck",
  QSource = "QSource",
  Swimming = "Swimming",
  Mobility = "Mobility",
  Bike = "Bike",
  Gear = "Gear",
  "Wild Card" = "Wild Card",
  "2ndF" = "2ndF",
  // Cycling // Bike
  // CORE // Bootcamp
  // Run with Pain Stations // Run
  // Speed/Strength Running // Run
  // Obstacle Training // Gear
  // Strength/Conditioning/Tabata/WIB // Bootcamp
  // Mobility/Stretch // Mobility
}

export enum OrgTypes {
  AO = "AO",
  Region = "Region",
  Area = "Area",
  Sector = "Sector",
}

export enum EventTags {
  Open = "Open",
  VQ = "VQ",
  Manniversary = "Manniversary",
  Convergence = "Convergence",
}

export enum EventCategories {
  "1st F - Core Workout" = "1st F - Core Workout",
  "1st F - Pre Workout" = "1st F - Pre Workout",
  "1st F - Off the books" = "1st F - Off the books",
  "2nd F - Fellowship" = "2nd F - Fellowship",
  "3rd F - Faith" = "3rd F - Faith",
}
