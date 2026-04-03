import express from "express";
import routes from "./src/routes/index";
import { AppDataSource } from "./src/config/data-source";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 5000;



AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err: Error) => {
        console.error("Error during Data Source initialization:", err);
    });