import express, { Request, Response } from "express";
import { Pool } from "pg";
import { initDB } from "./database/db";
import { userRoute } from "./modules/user/user.route";

const app = express();

// middleware 
app.use(express.json());



// user routes
app.use("/api/v1", userRoute);

// vehicle routes


// booking routes

initDB();


// get method for home route to test the server
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "this is the home route",
        path: req.path
    })
})

app.listen(5000, () => {
    console.log("server is running on port 5000");
})