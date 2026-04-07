import express from "express";
import routes from "./src/routes/index";
import AppDataSource from "./src/config/data-source";
import cors from "cors";
import { errorHandler } from "./src/app/middleware/errorHandler";
import path from "path";

const app = express();
app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'src/public/uploads')));


app.use("/api", routes);
app.use(errorHandler);

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