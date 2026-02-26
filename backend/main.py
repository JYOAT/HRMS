import os
import ssl
from datetime import date, datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, String, Integer, Date, ForeignKey, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv


load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

# Convert to async URL
ASYNC_DATABASE_URL = DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Async Engine & Session

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

Base = declarative_base()

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI()
origins = [
    "http://localhost:5173",              # local dev
    FRONTEND_URL      # your deployed frontend
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------
class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)

    attendance = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan"
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id", ondelete="CASCADE"))
    date = Column(Date, default=date.today)
    status = Column(String, nullable=False)

    employee = relationship("Employee", back_populates="attendance")


# -----------------------------
# Pydantic Schemas
# -----------------------------
class EmployeeCreate(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    department: str


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str


# Employee APIs

@app.post("/employees", status_code=201)
async def create_employee(employee: EmployeeCreate):
    async with AsyncSessionLocal() as session:

        existing = await session.get(Employee, employee.id)
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Employee ID already exists"
            )

        result = await session.execute(
            text("SELECT * FROM employees WHERE email = :email"),
            {"email": employee.email}
        )

        if result.first():
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        new_employee = Employee(**employee.dict())
        session.add(new_employee)
        await session.commit()

        return {"message": "Employee created successfully"}


@app.get("/employees")
async def get_employees():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("SELECT * FROM employees")
        )
        employees = result.fetchall()
        return [dict(e._mapping) for e in employees]


@app.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    async with AsyncSessionLocal() as session:
        employee = await session.get(Employee, employee_id)

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee not found"
            )

        await session.delete(employee)
        await session.commit()

        return {"message": "Employee deleted successfully"}



# Attendance APIs

@app.post("/attendance", status_code=201)
async def mark_attendance(attendance: AttendanceCreate):
    async with AsyncSessionLocal() as session:

        employee = await session.get(Employee, attendance.employee_id)
        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee not found"
            )

        if attendance.status not in ["Present", "Absent"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )

        record = Attendance(**attendance.dict())
        session.add(record)
        await session.commit()

        return {"message": "Attendance recorded"}


# ✅ FIXED VERSION (Date filter works properly)
@app.get("/attendance/{employee_id}")
async def get_attendance(
    employee_id: str,
    date: str | None = Query(None)
):
    async with AsyncSessionLocal() as session:

        sql = "SELECT * FROM attendance WHERE employee_id = :id"
        params = {"id": employee_id}

        if date:
            try:
                parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid date format. Use YYYY-MM-DD"
                )

            sql += " AND date = :date"
            params["date"] = parsed_date

        result = await session.execute(text(sql), params)
        records = result.fetchall()

        return [dict(r._mapping) for r in records]


# -----------------------------
# Root endpoint
# -----------------------------
@app.get("/")
async def root():
    return {"message": "Hello World"}