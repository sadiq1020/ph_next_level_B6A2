import express, { Request, Response } from "express";
import { initDB } from "./database/db";
import config from "./config";
import { authRoute } from "./modules/auth/auth.route";
import { userRoute } from "./modules/user/user.route";
import { vehicleRoute } from "./modules/vehicle/vehicle.route";

const app = express();
const port = config.port;

// middleware 
app.use(express.json());


// 1. auth route
app.use("/api/v1/auth", authRoute);

// 2. user routes
app.use("/api/v1/users", userRoute);

// 3. vehicle routes
app.use("/api/v1/vehicles", vehicleRoute);

// 4. booking routes

initDB();


// get method for home route to test the server
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "this is the home route",
        path: req.path
    })
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})