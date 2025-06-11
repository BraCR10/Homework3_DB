import express from "express";
import cors from "cors";
import { initConnection } from "./config/db.config";
import Router from "./routes";

const app = express();
export const useMock = process.env.USE_MOCK === "True" ? true : false;

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["http://localhost:3000", "http://localhost:30001"]
    : ["http://localhost:3000", "http://localhost:30001"];

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  allowedHeaders: "Content-Type,Authorization, User-Id",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/v2", Router);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  const startServer = async (): Promise<void> => {
    try {
      await initConnection();
      app.listen(PORT, () => {
        console.log(`API running on port http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("Error details: ", error);
      process.exit(1);
    }
  };

  startServer();
}

(async () => {
  if (process.env.NODE_ENV === "production") {
    try {
      await initConnection();
      console.log("Database connection initialized for serverless environment");
    } catch (error) {
      console.error("Error initializing database connection:", error);
    }
  }
})();

export default app;
