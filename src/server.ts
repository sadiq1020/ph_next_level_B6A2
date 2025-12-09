import express, { Request, Response } from "express";
import { Pool } from "pg";

const app = express();

// middleware 
app.use(express.json());

// connecting db
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_hC6WbDUSJT2p@ep-weathered-breeze-a893ef3z-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
})

// creating tables 
const initDB = async () => {

    // creating users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password TEXT NOT NULL CHECK (LENGTH(password) >= 6),
                phone VARCHAR(20) NOT NULL,
                role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `) // check the role again, if it is ok write like this

    // create Vehicles table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(150) NOT NULL,
                type VARCHAR(10) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
                registration_number	VARCHAR(30) UNIQUE NOT NULL,
                daily_rent_price NUMERIC(10, 2) NOT NULL CHECK (daily_rent_price > 0),
                availability_status VARCHAR(10) NOT NULL CHECK (availability_status IN ('available','booked')) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
        )
            `)

    await pool.query(`
                CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
                rent_start_date TIMESTAMP NOT NULL,
                rent_end_date TIMESTAMP NOT NULL CHECK (rent_end_date > rent_start_date),
                total_price NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
                )
                `)
}

// creating a new user: (post method)
app.post("/users", async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;
    const result = await pool.query(
        `INSERT INTO users(name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [name, email, password, phone, role]
    );
    // console.log(result);
    res.status(201).json({
        success: true,
        data: result.rows[0],
        message: "user created successfully"
    })

})

initDB();

// get method
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "this is the home route",
        path: req.path
    })
})

app.listen(5000, () => {
    console.log("server is running on port 5000");
})