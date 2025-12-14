import { Pool } from "pg";
import config from "../config";
// connecting db
// dotenv.config({ path: path.join(process.cwd(), ".env") });
export const pool = new Pool({
    connectionString: `${config.connection_str}`
});
// creating tables 
export const initDB = async () => {
    try {
        // create "users" table
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
        `);
        // create "Vehicles" table
        await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(150) NOT NULL,
                type VARCHAR(10) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
                registration_number VARCHAR(30) UNIQUE NOT NULL,
                daily_rent_price NUMERIC(10, 2) NOT NULL CHECK (daily_rent_price > 0),
                availability_status VARCHAR(10) NOT NULL CHECK (availability_status IN ('available','booked')) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
        );
            `);
        // create "bookings" table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
                rent_start_date TIMESTAMP NOT NULL CHECK (rent_start_date >= CURRENT_TIMESTAMP),
                rent_end_date TIMESTAMP NOT NULL CHECK (rent_end_date > rent_start_date),
                total_price NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
                status VARCHAR(10) NOT NULL CHECK (status IN ('active','cancelled','returned')) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
`);
    }
    catch (err) {
        console.error("Error initializing database:", err);
    }
};
