# BudgetWise-AI-Driven-Expense-Tracker-and-Budget-Advisor

BudgetWise – Expense Tracker is a modern full-stack financial management platform designed to help users track expenses, monitor income, set financial goals, and analyze spending patterns through interactive charts.
The frontend is built with React and a glassmorphism-based UI, while the backend (Java + Spring Boot) handles secure authentication, user management, and CRUD operations for expenses and profiles.
### The project includes:
##### - User authentication (Login / Signup)
##### - Profile management with image upload
##### - Add, Edit, Delete expenses
##### - Category-based tracking
##### - Monthly & yearly analytical reports
##### - Secure account deletion with verification

### Configuration
To run this application, you need to set the following environment variables. You can set them in your IDE or system environment.

- `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb+srv://...`)
- `MAIL_HOST`: SMTP server host (e.g., `smtp.gmail.com`)
- `MAIL_PORT`: SMTP server port (e.g., `587`)
- `MAIL_USERNAME`: Your email address
- `MAIL_PASSWORD`: Your email app password
- `JWT_SECRET`: A secure secret key for JWT signing
- `JWT_EXPIRATION`: Token expiration time in milliseconds

