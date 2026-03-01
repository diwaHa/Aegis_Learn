# Contributing to A2UI

Thank you for your interest in contributing to A2UI! This document provides guidelines for contributors.

## 🤝 How to Contribute

### 🐛 Reporting Issues

1. **Search existing issues** before creating a new one
2. **Use the issue templates** when reporting bugs or requesting features
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### 💡 Feature Requests

1. **Check the roadmap** for planned features
2. **Create a detailed proposal** explaining:
   - The problem you're solving
   - Proposed solution
   - Implementation approach
   - Potential impact

### 🔧 Code Contributions

#### Prerequisites
- Node.js 18+
- Python 3.8+
- Familiarity with React/Next.js
- Understanding of FastAPI and Python

#### Setup

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/a2ui-hackathon.git
cd a2ui-hackathon
```

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Install dependencies**
```bash
# Frontend
cd website
npm install

# Backend (optional)
cd ../middleware
pip install -r requirements.txt
```

4. **Make your changes**
5. **Test thoroughly**
6. **Submit a pull request**

#### Code Standards

- **TypeScript**: Use strict typing
- **Python**: Follow PEP 8 guidelines
- **Comments**: Document complex logic
- **Testing**: Include tests for new features
- **Security**: Follow security best practices

#### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md**
5. **Submit PR with detailed description**

## 🏗️ Project Structure

```
a2ui-hackathon/
├── website/                 # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and API
│   │   └── types/         # TypeScript definitions
│   ├── public/            # Static assets
│   └── package.json
├── middleware/             # FastAPI backend
│   ├── modes/            # AI mode handlers
│   ├── core/             # Core functionality
│   └── main.py           # FastAPI app
├── a2a_agents/           # A2UI agent implementations
├── renderers/            # UI renderers
├── samples/              # Sample applications
└── specification/        # A2UI protocol docs
```

## 🎯 Contribution Areas

### Frontend
- UI/UX improvements
- Component enhancements
- Performance optimization
- Accessibility features
- Mobile responsiveness

### Backend
- AI model integration
- API enhancements
- Security improvements
- Performance optimization
- Monitoring and logging

### A2UI Protocol
- Protocol extensions
- New component types
- Validation improvements
- Documentation

### Documentation
- API documentation
- User guides
- Tutorials
- Examples

## 🧪 Testing

### Frontend Testing
```bash
cd website
npm run test
npm run lint
npm run type-check
```

### Backend Testing
```bash
cd middleware
pytest
```

## 📝 Documentation

- **README.md**: Project overview and quick start
- **API docs**: Endpoint documentation
- **Component docs**: Component usage examples
- **Protocol docs**: A2UI protocol specification

## 🚀 Deployment

### Development
```bash
cd website
npm run dev

cd ../middleware
uvicorn main:app --reload
```

### Production
```bash
# Frontend (Vercel)
vercel --prod

# Backend (Docker)
docker build -t a2ui-backend .
docker run -p 8000:8000 a2ui-backend
```

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Maintain professional communication

### Communication
- Use GitHub issues for bugs and features
- Join our Discord for discussions
- Follow our contribution guidelines

## 🏆 Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Invited to our contributor community
- Eligible for contributor rewards

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discord**: For general discussions
- **Documentation**: For usage questions
- **Email**: For private inquiries

---

Thank you for contributing to A2UI! 🚀
