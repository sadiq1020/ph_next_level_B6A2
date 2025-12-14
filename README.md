# 🚗 Vehicle Rental System API

A comprehensive backend API for managing vehicle rentals with automatic booking management, built with Node.js, Express, TypeScript, and PostgreSQL.

## 🌐 Links

- **Live API:** [https://ph-next-level-b6a2.vercel.app/](https://ph-next-level-b6a2.vercel.app/)
- **GitHub Repository:** [https://github.com/sadiq1020/ph_next_level_B6A2](https://github.com/sadiq1020/ph_next_level_B6A2)

---

## ✨ Features

### 👤 User Management
- User registration and JWT-based authentication with secure password hashing
- Role-based access control (Admin & Customer)
- Profile management - users can update own profiles, admins can manage all users
- Users with active bookings cannot be deleted

### 🚙 Vehicle Management
- Complete CRUD operations with availability tracking
- Automatic status updates (available/booked)
- Vehicles with active bookings cannot be deleted

### 📅 Booking Management
- Create bookings with automatic price calculation based on rental duration
- Real-time vehicle availability validation
- **Customer:** View own bookings, cancel before start date
- **Admin:** View all bookings, mark as returned
- Transaction-safe booking operations

### 🤖 Automation
- Automatically updates expired bookings to "returned" status
- Automatically releases vehicles when bookings end or are cancelled
- Runs seamlessly before data fetching to ensure fresh data

---

## 🛠️ Technology Stack

**Backend:** Node.js, Express.js, TypeScript  
**Database:** PostgreSQL with pg driver  
**Authentication:** JWT (JSON Web Tokens)  
**Security:** bcryptjs for password hashing  
**Environment:** dotenv for configuration  
**Architecture:** MVC pattern with modular structure (Controllers, Services, Routes)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/sadiq1020/ph_next_level_B6A2.git
cd ph_next_level_B6A2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_rental_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

4. **Run the application**

The database tables will be created automatically on first run.

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will start at `http://localhost:5000`

---

## 🗃️ Database Schema

**Users:** id, name, email, password (hashed), phone, role (admin/customer), timestamps

**Vehicles:** id, vehicle_name, type (car/bike/van/SUV), registration_number, daily_rent_price, availability_status (available/booked), timestamps

**Bookings:** id, customer_id (FK), vehicle_id (FK), rent_start_date, rent_end_date, total_price, status (active/cancelled/returned), timestamps

**Relationships:** Bookings reference Users and Vehicles with CASCADE delete

---

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT authentication with configurable expiration
- SQL injection prevention (parameterized queries)
- Role-based authorization
- Environment variable protection

---

## 🔄 Key Business Rules

1. **Booking Creation:** Vehicle must be available, start date cannot be in past, price auto-calculated
2. **Customer Cancellation:** Only own bookings, only before start date, vehicle becomes available immediately
3. **Admin Return:** Marks booking as returned, vehicle becomes available
4. **Auto-Update:** Expired bookings automatically marked as "returned" when fetching data
5. **Delete Protection:** Users and vehicles with active bookings cannot be deleted

---

## 🚀 Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Push code to GitHub
2. Connect repository to Vercel/Render/Railway
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`
4. Deploy

**Database Options:** Render PostgreSQL, Railway, Supabase, Neon (all have free tiers)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sadiq**
- GitHub: [@sadiq1020](https://github.com/sadiq1020)
- Repository: [ph_next_level_B6A2](https://github.com/sadiq1020/ph_next_level_B6A2)

---

**Built with Node.js, Express, TypeScript, and PostgreSQL** ❤️