FROM python:3.11-slim

WORKDIR /app

# System deps for spaCy compilation
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm

# Copy project
COPY . .

EXPOSE 8000

# Run from middleware/ context so `app.*` imports resolve
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
