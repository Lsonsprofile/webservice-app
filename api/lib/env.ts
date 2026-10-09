import "dotenv/config";

export const env = {
  appSecret: process.env.APP_SECRET?.trim() ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
  databaseUrl: process.env.DATABASE_URL?.trim() ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID?.trim() ?? "",
};
