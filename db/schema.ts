import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// A learner marking one section (topic) as complete.
export const sectionProgress = mysqlTable(
  "section_progress",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleId: varchar("moduleId", { length: 32 }).notNull(),
    sectionId: varchar("sectionId", { length: 128 }).notNull(),
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("section_progress_user_section").on(t.userId, t.sectionId)],
);

export type SectionProgress = typeof sectionProgress.$inferSelect;
export type InsertSectionProgress = typeof sectionProgress.$inferInsert;

// One row per quiz attempt, keeping the best score per module.
export const quizResults = mysqlTable(
  "quiz_results",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleId: varchar("moduleId", { length: 32 }).notNull(),
    score: int("score").notNull(),
    totalQuestions: int("totalQuestions").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("quiz_results_user_module").on(t.userId, t.moduleId)],
);

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;
