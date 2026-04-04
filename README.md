Here’s a **clean, professional, detailed README.md** for your project based on the codebase structure 👇

---

# 🚀 HireX – AI-Powered Recruitment Platform

HireX is a modern, full-stack recruitment platform that streamlines the hiring process for both recruiters and candidates. It integrates AI-powered features like ATS scoring, interview question generation, and automated communication to enhance hiring efficiency.

---

## 📌 Features

### 👨‍💼 Recruiter Module

* Create and manage job postings
* View and track candidate applications
* AI-based ATS score evaluation
* Generate interview questions automatically
* Send emails using templates
* Generate appointment letters
* Application status management dashboard

### 👩‍💻 Candidate Module

* Browse available jobs
* Apply for jobs with a structured form
* Track application status
* Personalized dashboard experience

### 🤖 AI Features

* Resume ATS scoring
* Interview question generation
* AI chat support
* Appointment letter generation

---

## 🛠️ Tech Stack

### Frontend

* **Next.js 16 (App Router)**
* **React 19**
* **Tailwind CSS**
* **ShadCN UI / Radix UI**

### Backend

* **Next.js API Routes**
* **Supabase (Auth + Database)**

### AI Integration

* **Google Generative AI (@google/generative-ai)**

### Other Tools

* React Hook Form + Zod (validation)
* Lucide Icons
* Recharts (analytics)
* Sonner (toast notifications)

---

## 📂 Project Structure

```
HireX/
│
├── app/
│   ├── recruiter/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   ├── applications/
│   │   └── templates/
│   │
│   ├── candidate/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   └── applications/
│   │
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── api/
│   │   ├── ats-score/
│   │   ├── interview-questions/
│   │   ├── chat/
│   │   ├── send-email/
│   │   └── generate-appointment-letter/
│   │
│   └── setup/
│
├── components/
├── public/
├── styles/
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/hirex.git
cd hirex
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3️⃣ Environment Variables

Create a `.env.local` file and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GOOGLE_API_KEY=your_google_generative_ai_key
```

---

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🔐 Authentication

* Implemented using **Supabase Auth**
* Supports:

  * Login
  * Signup
  * Session handling (SSR)

---

## 📊 API Endpoints

| Endpoint                           | Description              |
| ---------------------------------- | ------------------------ |
| `/api/ats-score`                   | Generate ATS score       |
| `/api/interview-questions`         | AI interview questions   |
| `/api/chat`                        | AI chatbot               |
| `/api/send-email`                  | Send email to candidates |
| `/api/generate-appointment-letter` | Generate offer letter    |

---

## 🧠 Key Functionalities

### ✔ ATS Scoring

* Evaluates resumes against job descriptions
* Provides score and insights

### ✔ Interview Question Generator

* AI-generated role-specific questions

### ✔ Email Automation

* Predefined templates
* Easy recruiter communication

### ✔ Appointment Letter Generator

* Auto-generate offer letters for selected candidates

---

## 📄 Test Credentials

Refer to:

```
TEST_CREDENTIALS.md
```

---

## 🧪 Setup Guide

Refer to:

```
SETUP_INSTRUCTIONS.md
```

---

## 🚀 Deployment

You can deploy using:

* **Vercel (Recommended)**

```bash
vercel deploy
```

---

## 💡 Future Improvements

* Video interview integration
* Resume parsing (PDF → structured data)
* Advanced analytics dashboard
* Multi-language support
* Mobile app (Flutter integration possible 👀)

---

## 🤝 Contributing

Contributions are welcome!

```bash
fork → clone → create branch → commit → push → PR
```

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Praemjith P.R**

* AI & Drone Developer ✈️
* Passionate about building real-world intelligent systems

---

