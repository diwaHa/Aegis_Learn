# 🛡️ Aegis Learn - Multi-Mode AI Middleware Platform

> **A smart, privacy-aware, academically-structured, cost-optimized AI proxy** built for the AMD Singapore Hackathon 2025

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_API-2.5-4285F4?logo=google)](https://ai.google.dev/)

## 🌟 About

Aegis Learn is a **Multi-Mode Intelligent AI Platform** that sits between your application and an LLM (like Gemini/GPT-4). Instead of calling an LLM directly and getting raw text, the middleware adds structure, privacy, efficiency, and intelligence to every request.

### 🎯 Built For AMD Slingshot Hackathon 2025

This project was developed for the AMD Slingshot Hackathon, showcasing advanced AI middleware capabilities with privacy protection, academic structuring, and intelligent UI generation.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm** or **yarn**
- **Python 3.9+** and **pip**
- **Google Gemini API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/aegis-learn.git
   cd Aegis-learn
   ```

2. **Backend Setup**
   ```bash
   cd middleware
   pip install -r requirements.txt
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Frontend Setup**
   ```bash
   cd ../website
   npm install
   cp .env.example .env.local
   # Edit .env.local with API URL
   ```

### Running the Application

1. **Start the Backend** (Terminal 1)
   ```bash
   cd middleware
   python main.py
   # Backend runs on http://localhost:8000
   ```

2. **Start the Frontend** (Terminal 2)
   ```bash
   cd website
   npm run dev
   # Frontend runs on http://localhost:3001
   ```

3. **Access the Application**
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

---

## 🧠 Core Features

### 🔐 Privacy-First AI (General Mode)

- **PII Redaction**: Automatically strips names, emails, phone numbers, Aadhaar numbers, medical terms, and financial identifiers
- **Risk Scoring**: Real-time content risk assessment
- **Audit Trails**: Complete logging for compliance

### 📚 Academic Intelligence (Study Mode)

- **Structured Responses**: 2-mark answers, 13-mark answers (with diagrams + 6 points + conclusions)
- **Multiple Formats**: MCQs, Case Studies, and academic essays
- **Intent Analysis**: Differentiates casual chat from academic questions
- **Smart Schema Selection**: Automatically chooses the right response format

### 💡 Dynamic UI Generation (Code Mode + A2UI)

- **Natural Language to UI**: Convert descriptions into functional interfaces
- **A2UI v0.9 Specification**: Industry-standard UI generation format
- **Interactive Components**: Buttons, forms, inputs, and layouts
- **Real-time Rendering**: Live preview of generated interfaces

### 🎓 Smart Integration

- **Google Classroom Integration**: Fetch real assignment deadlines
- **Intelligent Reminders**: 48-hour advance notifications
- **Academic Format Suggestions**: Context-aware response recommendations

---

## 🏗️ Architecture

### Backend Stack
- **FastAPI**: High-performance async web framework
- **Google Gemini 2.5**: Advanced language model
- **Pydantic**: Data validation and serialization
- **Semantic Cache**: Token optimization and context pruning
- **JWT Authentication**: Secure token-based auth

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **ShadCN UI**: Modern component library

### A2UI System
- **A2UI Agent**: Python-based UI generation
- **v0.9 Specification**: Standardized component format
- **Real-time Rendering**: Live component preview
- **Interactive Elements**: Click handlers and form inputs

---

## 📊 Project Status

### ✅ All 6 Phases Complete

| Phase | Feature | Status |
|---|---|---|
| **1** | FastAPI Gateway + Mode Router + Code Mode (A2UI) | ✅ Complete |
| **2** | Structured Study Engine (Pydantic Schemas) | ✅ Complete |
| **3** | Privacy Middleware: PII Redaction + Risk Scoring | ✅ Complete |
| **4** | Token Optimization: Semantic Cache + Context Pruning | ✅ Complete |
| **5** | Google Classroom Integration + Smart Reminders | ✅ Complete |
| **6** | Monitoring Dashboard: Analytics, Heatmap, Audit Export | ✅ Complete |

---

## 👥 Target Audience

| Audience | How They Benefit |
|---|---|
| **Students** | Smart exam preparation, structured answers, deadline reminders |
| **Educational Institutions** | Standardized AI output that matches academic formats |
| **Healthcare SaaS companies** | HIPAA-leaning privacy layer before sending prompts to any LLM |
| **Finance/Legal firms** | Industry-specific PII redaction and audit trails for compliance |
| **AI developers / startups** | A reusable middleware layer to add to any LLM-powered product |
| **Enterprise IT teams** | A privacy proxy they can deploy in front of any commercial LLM API |

---

## 🛠️ Usage Examples

### General Mode (Privacy-Protected Chat)
```bash
# Chat with automatic PII redaction
"Hi, my name is John Doe and my email is john@example.com. I need help with a sensitive medical question."
# → PII automatically redacted before reaching LLM
```

### Study Mode (Academic Responses)
```bash
# Get structured academic answers
"What is artificial intelligence? Explain in detail."
# → Returns 13-mark format with intro, diagram description, 6 explanation points, advantages, and conclusion
```

### Code Mode (UI Generation)
```bash
# Generate user interfaces
"Create a login form with username and password fields"
# → Returns A2UI v0.9 JSON that renders as a functional login form
```

---

## 🔧 Configuration

### Backend Environment (.env)
```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
LITELLM_MODEL=gemini-2.5-flash

# JWT Authentication
JWT_SECRET=your_jwt_secret_here

# Database/Cache (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
aegis-learn/
├── middleware/                 # FastAPI Backend
│   ├── main.py                # Main application entry
│   ├── router.py              # Request routing logic
│   ├── core/                  # Core utilities
│   │   ├── llm.py             # LLM integration
│   │   ├── auth.py            # JWT authentication
│   │   ├── cache.py           # Semantic caching
│   │   └── privacy.py         # PII redaction
│   ├── modes/                 # AI operation modes
│   │   ├── general_mode.py    # Privacy-protected chat
│   │   ├── study_mode.py      # Academic responses
│   │   └── code_mode.py       # UI generation
│   └── requirements.txt       # Python dependencies
├── website/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/        # React components
│   │   └── lib/              # Utilities and API
│   ├── package.json          # Node.js dependencies
│   └── tailwind.config.ts    # Tailwind configuration
├── a2a_agents/               # A2UI Generation System
│   └── python/a2ui_agent/    # Python A2UI agent
├── specification/            # A2UI v0.9 Specification
├── samples/                  # A2UI Examples
└── tools/                    # Development tools
```

---

## 🧪 Testing

### Backend Tests
```bash
cd middleware
python test.py
pytest tests/
```

### Frontend Tests
```bash
cd website
npm run test
npm run test:e2e
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/

# Test authentication
curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'

# Test chat with token
curl -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "general", "message": "Hello!"}'
```

---

## 📚 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/auth/token` | POST | Get JWT token |
| `/chat` | POST | Send chat message |
| `/a2ui/generate` | POST | Generate UI from text |
| `/audit-logs` | GET | View audit logs |
| `/cache-stats` | GET | Cache statistics |

### Request Examples

#### Chat Request
```json
{
  "mode": "study",
  "message": "What is photosynthesis?",
  "session_id": "user123",
  "industry": "education"
}
```

#### A2UI Request
```json
{
  "message": "Create a contact form",
  "session_id": "default_session",
  "a2ui_data": {}
}
```

---

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
cd middleware
docker-compose up -d
```

### Production Environment
1. **Backend**: Deploy to cloud service (AWS, GCP, Azure)
2. **Frontend**: Deploy to Vercel, Netlify, or similar
3. **Environment**: Set production API keys and secrets
4. **Monitoring**: Enable audit logs and analytics

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **AMD Slingshot** for hosting the hackathon
- **Google** for the Gemini API
- **FastAPI** team for the excellent framework
- **Next.js** team for the React framework
- **A2UI Community** for the UI generation specification

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/aegis-learn/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/aegis-learn/discussions)
- **Email**: your-email@example.com

---

**⭐ If this project helped you, please give it a star!**

---
