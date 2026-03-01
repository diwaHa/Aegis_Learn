FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for spaCy
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY middleware/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy entire project
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start server
CMD ["python", "-m", "middleware.main"]
