# Learning Weekly Target

> **Capstone Project** - A weekly learning target management application with progress tracking and streak gamification system.

## 📋 About the Project

Learning Weekly Target is a web application designed to help students effectively manage their weekly learning targets. The application provides a detailed progress tracking system, from classes, modules, to submodules, equipped with streak gamification features to increase learning motivation.

**Note**: This is a capstone project developed as part of a learning program.

---

## ✨ Key Features

### 🎯 Target Management

- **Weekly Targets**: Set module targets to complete each week
- **Progress Tracking**: Monitor learning progress in real-time from class level to submodule
- **Task Completion**: Mark submodules as complete with automatic tracking system

### 🔥 Gamification System

- **Streak System**: Earn streaks (fire 🔥) every time you complete a full module
- **Leaderboard**: Healthy competition by viewing rankings based on learning consistency
- **Achievement Tracking**: Track achievements and learning progress

### 📅 Scheduling

- **Schedule Management**: Arrange daily study schedules
- **Daily Planning**: Plan learning activities for time optimization

### 🔐 Authentication & Security

- **User Authentication**: Secure login/registration system with JWT
- **Protected Routes**: Controlled access for each user

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom CSS
- **Routing**: React Router DOM

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Token)
- **API**: RESTful API architecture

### Database

- **DBMS**: MySQL
- **Tool**: phpMyAdmin (for development)

---

## 🏗️ Application Architecture

```
learning-weekly-target/
├── backend/                 # Server-side application
│   ├── capstone.sql        # Database schema & seed data
│   ├── server.js           # Express server setup
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation middleware
│   └── .env                # Environment variables
│
├── src/                    # Frontend application
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── assets/            # Images, icons, etc.
│   └── App.jsx            # Main app component
│
├── public/                # Static assets
└── index.html             # HTML entry point
```

---

## 📦 Prerequisites

Make sure your system has the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **XAMPP** or other MySQL server
- **Git** (for cloning repository)

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd learning-weekly-target
```

### 2️⃣ Setup Database

1. Run **XAMPP** and activate **Apache** and **MySQL** modules
2. Open browser, access [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Create a new database named: **`capstone`**
4. Import SQL file:
   - Click **Import** tab
   - Select file `backend/capstone.sql`
   - Click **Go** or **Import**
5. Verify that all tables have been created successfully

### 3️⃣ Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file according to your database configuration
# Default: user=root, password=empty

# Run server
npm start
```

Server will run at **http://localhost:3000**

### 4️⃣ Setup Frontend

Open a new terminal (don't close the backend terminal):

```bash
# Return to root directory
cd ..

# Install dependencies
npm install

# Run development server
npm run dev
```

Application will run at **http://localhost:5173**

---

## 📖 Usage Guide

### Getting Started

1. **Registration**: Create a new account by filling out the registration form
2. **Login**: Log in using your created credentials

### Setting Learning Targets

1. **Set Weekly Target**:
   - Open the Weekly Targets page
   - Select modules you want to complete this week
   - Save your targets

### Learning Process

1. **Access Dashboard**: View an overview of your learning progress
2. **Select Class**: Choose the class you want to study
3. **Start Learning**:
   - Open modules and submodules
   - Read the provided materials
   - Click "Next" button after finishing reading

### Progress Tracking

1. **Check Streak**:
   - Streak will increase automatically after completing a full module
   - View your streak on the dashboard
2. **Leaderboard**:
   - Compare progress with other users
   - Motivation to study consistently

### Schedule Management

1. **Manage Schedule**:
   - Set daily study schedules
   - Plan optimal learning activities

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory with the following configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=capstone
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

---

## 🎯 Key Features Explained

### Streak System

The streak system is designed to encourage learning consistency:

- ✅ Complete all submodules in one module → Streak +1
- 🔥 Maintain daily/weekly streaks for higher ranking
- 🏆 Appear on leaderboard based on total streaks

### Progress Tracking

Progress tracking hierarchy:

```
Class → Module → Submodule
```

- Each submodule can be marked as complete
- Progress is calculated in real-time
- Visual indicator for progress at each level

---

## 🤝 Contributing

This project is developed as a capstone project. For questions or suggestions, please contact through this repository.

**Contact**: [zikrihilmi15@gmail.com](mailto:zikrihilmi15@gmail.com)

---

## 📄 License

This project is created for learning purposes and capstone project evaluation.

---

## 🙏 Acknowledgments

Thank you to everyone who has supported the development of this project, including mentors, reviewers, and resources used in the learning process.
