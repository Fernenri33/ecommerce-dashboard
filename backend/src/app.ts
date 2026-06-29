import express from "express";
import cors from "cors";
import { router } from "./adapters/http/routes.js";

export const app = express();

// Middlewares globales compartidos por todos los endpoints de la API.
app.use(cors());
app.use(express.json());

// Las rutas HTTP viven en adapters porque son la entrada externa al dominio.
app.use("/", router);
