# HRMS Project

## Project Overview

This is a Human Resource Management System (HRMS) for managing employees and their attendance. The project consists of a **frontend** built with React and a **backend** built with Python and FastAPI. The backend uses **Neon (PostgreSQL)** as the database.

---

## Tech Stack

- **Frontend:** React (JavaScript) + Vite
- **Backend:** Python + FastAPI
- **Database:** Neon (PostgreSQL)
- **Deployment:** Frontend and backend are deployed separately

---

## Folder Structure

root/
│
├── frontend/ # React frontend
├── backend/ # FastAPI backend
└── README.md # This file

---

## Running the Project Locally

Running the Project Locally

⚠️ Important: The backend .env file contains sensitive information (database credentials). To run locally, create your own .env file in the backend/ folder with your Neon connection string.

# Backend Setup

1. Navigate to the backend folder:

   cd backend

2. Create a .env file with your Neon DB URL:

   DATABASE_URL=postgresql://<username>:<password>@<host>/<database>

3. Create a virtual environment and activate it:

   python -m venv venv

   -- Activate on Windows
   venv\Scripts\activate

   -- Activate on macOS/Linux
   source venv/bin/activate

4. Install dependencies:

   pip install -r requirements.txt

5. Run the FastAPI server:

   uvicorn main:app --reload

# Frontend Setup

1. Navigate to the frontend folder:

   cd frontend

2. Install dependencies:

   npm install

3. Start the development server:

   npm run dev

4. Open your browser and visit the URL shown in the terminal (usually http://localhost:5173)

### Deployed backend link

https://hrms-jq2p.onrender.com

### Deployed frontend link

https://hrms-proj.netlify.app/
