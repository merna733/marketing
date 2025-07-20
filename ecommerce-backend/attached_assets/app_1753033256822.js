import express from "express";
import { dbConnection } from "./db/dbconnection.js";
import cors from "cors";
import userRoutes from "./src/modules/user/userRoutes.js";
import perfumeRoutes from "./src/modules/perfume/perfumeRoutes.js";
import cartRoutes from "./src/modules/cart/cartRoutes.js";
import orderRoutes from "./src/modules/order/orderRoutes.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:4200",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

dbConnection;

app.use("/users", userRoutes);
app.use("/perfumes", perfumeRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.use((req, res) => {
    res.status(404).json({ message: " Can't get it" });
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
