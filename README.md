# 🚀 Nebula Flow

Nebula Flow is a full-stack web application that converts code repositories into structured architecture insights and visualizations.
It helps developers understand project structure, dependencies, and system design automatically.

This project includes:

* ⚛️ React (Vite) frontend
* 🟢 Node.js + Express backend
* 🔐 Authentication system
* 📊 Repository analysis & visualization

---

## 📌 Features

* User authentication (signup / login)
* Repository analysis engine
* Architecture visualization
* REST API backend
* Scalable full-stack structure
* Environment-based configuration

---

## 🏗️ Project Structure

```
nebula-flow/
│
├── frontend/              # React frontend (Vite)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/               # Node.js Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   └── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Tech Stack

### Frontend

* React.js
* Vite
* Axios
* Tailwind CSS (if used)

### Backend

* Node.js
* Express.js
* REST API

### Tools

* Git & GitHub
* VS Code
* npm

---

## 🧑‍💻 Local Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/nebula-flow.git
cd nebula-flow
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
```

Create `.env` file inside backend folder:

```
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

Run backend:

```
npm start
```

Backend runs on:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

Open a new terminal:

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔗 API Endpoints (Example)

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Repository Analysis

```
POST /api/repo/analyze
GET /api/repo/history
```

---

## 🌍 Environment Variables

### Backend `.env`

```
PORT=
DATABASE_URL=
JWT_SECRET=
```

### Frontend `.env` (optional)

```
VITE_API_URL=http://localhost:5000
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```
git checkout -b feature-name
```

3. Commit your changes

```
git commit -m "Added new feature"
```

4. Push branch

```
git push origin feature-name
```

5. Open a Pull Request

---

## 🐞 Troubleshooting

### Reinstall dependencies

```
rm -rf node_modules
npm install
```

### Port already in use

Change the port number in `.env`

---

## 📦 Deployment (Planned)

* Frontend → Vercel / Netlify
* Backend → Render / Railway

---

## 👩‍💻 Author

Mansi Jagtap

---

## 📄 License

This project is licensed under the MIT License.
