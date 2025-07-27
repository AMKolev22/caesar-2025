<h1 align="center">🎓 Caesar Solutions – School Inventory System</h1>

<p align="center">
  A modern, full-stack inventory management system for schools, built for reliability, automation, and ease of use - because everyone deserves one.
</p>


---

## 💻 Technologies Used

- **Frontend:** Next.js (React 19), TypeScript, Tailwind CSS, Radix UI, Chart.js, qrcode.react
- **Backend/API:** Next.js API Routes, Prisma ORM, PostgreSQL, Express.js
- **Authentication:** next-auth, iron-session, jwt - nested symmetrical encryption
- **Email:** Nodemailer (SMTP)
- **Real-time:** Ably (Websockets)
- **Other:** js-cookie, next-themes, sonner (notifications), lucide-react (icons), framer-motion

---

## 🚀 How to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/caesar-2025.git
   cd caesar-2025/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your database, SMTP.
   - Consult prisma.js, nextauth.js on what variables to add.

4. **Set up the database:**
   ```bash
   npm i && npx prisma generate
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Project Workflow Diagram
- [Workflow Diagram](https://caesar-2025.vercel.app/workflow.svg)
- [Request Lifecycle](https://caesar-2025.vercel.app/request-lifecycle.svg)
- [Arch Diagram](https://caesar-2025.vercel.app/arch-diagram.svg)


---

## ✨ Features

- Inventory management for products and items
- QR code generation and scanning
- Automated workflows (e.g., low stock alerts, broken item handling)
- Role-based access (Admin, Manager, User)
- Real-time updates and notifications
- Email verification and password reset
- Modern, responsive UI
- [Live Demo](https://caesar-2025.vercel.app)

---
