# 🥗 Nourish AI

<div align="center">

### Snap. Track. Transform.

An AI-powered nutrition tracking platform that identifies meals from photos, estimates calories and macronutrients, and helps users monitor dietary habits and body progress with intelligent insights.

🌐 Track smarter, not harder.

</div>

---

## 📌 Overview

Nourish AI simplifies nutrition tracking through artificial intelligence.

Instead of manually searching food databases, estimating serving sizes, or calculating calories, users can simply upload a photo of their meal. The platform uses AI-powered food recognition to identify the dish and generate realistic estimates for:

- Calories
- Protein
- Carbohydrates
- Fat

Users can monitor daily intake, maintain streaks, track body measurements, and visualize progress over time.

---

## ✨ Features

### 📸 AI Food Recognition

Upload a meal photo and receive:

- Meal identification
- Serving size estimation
- Calorie estimation
- Macronutrient breakdown

Powered by computer vision and Gemini AI.

---

### 🔥 Calorie Tracking

Automatically log:

- Daily calories
- Consumed meals
- Remaining calorie budget
- Nutrition history

---

### 🥩 Macronutrient Analysis

Track:

- Protein
- Carbohydrates
- Fat

Visual macro distribution helps users understand their nutrition balance.

---

### 📈 Progress Dashboard

Monitor:

- Daily nutrition goals
- Calorie consumption
- Weight progress
- Measurement trends
- Activity streaks

---

### 📏 Body Measurements

Log and track:

- Weight
- Body measurements
- Weekly progress

Visualize changes over time using interactive charts.

---

### 🏆 Habit Building

Stay motivated through:

- Daily streak tracking
- Progress visualization
- Consistency monitoring

---

### 🔐 Secure Authentication

User authentication and profile management powered by Supabase.

---

## 🏗️ System Architecture

```text
              User
                │
                ▼

      Upload Food Image
                │
                ▼

       AI Vision Analysis
      (Gemini 2.5 Flash)
                │
                ▼

      Meal Identification
                │
                ▼

 Nutritional Estimation Engine
                │
                ▼

  Calories + Macronutrients
                │
                ▼

      Dashboard & History
                │
                ▼

     Progress Monitoring
```

---

## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Tailwind CSS 4
- Radix UI
- Framer Motion
- Recharts

### Backend

- Supabase
- Server Functions
- Authentication Middleware

### AI Layer

- Google Gemini 2.5 Flash
- Lovable AI Gateway

### Database

- Supabase PostgreSQL

### Deployment

- Vercel

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/thanishkaykb/Nourish-AI.git

cd Nourish-AI
```

### Install Dependencies

```bash
npm install
```

or

```bash
bun install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
LOVABLE_API_KEY=your_ai_api_key
```

### Run Development Server

```bash
npm run dev
```

---

## 📂 Project Structure

```text
src/
│
├── components/
│   ├── Dashboard Components
│   ├── Nutrition Visualizations
│   └── UI Components
│
├── routes/
│   ├── Dashboard
│   ├── Food Logging
│   ├── History
│   ├── Measurements
│   ├── Settings
│   └── Authentication
│
├── lib/
│   ├── AI Functions
│   ├── Profile Management
│   └── Utilities
│
├── integrations/
│   └── Supabase
│
└── assets/
```

---

## 🧠 AI Workflow

1. User uploads a food image.
2. Gemini AI analyzes the image.
3. The system identifies the meal.
4. Estimated serving size is calculated.
5. Calories, protein, carbs, and fat are generated.
6. Results are stored in the user's nutrition history.
7. Dashboard metrics update automatically.

---

## 📊 Key Metrics Tracked

### Nutrition

- Calories
- Protein
- Carbohydrates
- Fat

### Progress

- Weight
- Measurements
- Trends
- Daily goals

### Habits

- Tracking streaks
- Logging consistency
- Historical activity

---

## 🎯 Use Cases

### Fitness Enthusiasts

Track macros and calories without manual logging.

### Weight Loss Programs

Monitor caloric intake and body progress.

### Muscle Building

Maintain protein goals and nutrition consistency.

### General Health Tracking

Understand eating habits and long-term trends.

---

## 🔮 Future Enhancements

- Barcode scanning
- Meal recommendations
- Personalized diet plans
- AI nutrition coach
- Micronutrient analysis
- Water intake tracking
- Wearable integrations
- Smart fitness synchronization

---

## 📸 Screenshots

### Landing Page

_Add screenshot_

### AI Food Scanner

_Add screenshot_

### Nutrition Dashboard

_Add screenshot_

### Progress Tracking

_Add screenshot_

---

## 🏆 Research Relevance

Nourish AI explores the intersection of:

- Artificial Intelligence
- Computer Vision
- Nutrition Informatics
- Health Technology
- Human-Computer Interaction
- Personalized Wellness Systems

Potential applications include:

- Digital nutrition assistants
- AI-powered dietary monitoring
- Preventive healthcare systems
- Personalized wellness platforms

---

## 👨‍💻 Author

### Thanishka Yogesh

- GitHub: https://github.com/thanishkaykb
- LinkedIn: https://www.linkedin.com/in/thanishka-yogesh/
- Portfolio: https://portfolio-thanishka-yogesh.vercel.app/

---

## 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, consider giving it a star.

Built to make nutrition tracking effortless through the power of AI.
