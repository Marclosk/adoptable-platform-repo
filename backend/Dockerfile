    FROM python:3.10-slim

    ENV PYTHONDONTWRITEBYTECODE=1 \
        PYTHONUNBUFFERED=1 \
        POETRY_VIRTUALENVS_CREATE=false \
        POETRY_NO_INTERACTION=1
    
    WORKDIR /app
    
    RUN apt-get update && \
        apt-get install -y --no-install-recommends \
          build-essential \
          libpq-dev && \
        rm -rf /var/lib/apt/lists/*
    
    RUN pip install "poetry>=1.8.0"
    
    COPY backend/pyproject.toml backend/poetry.lock /app/
    
    RUN poetry install --no-root --only main
    
    COPY backend/ /app
    
    EXPOSE 8000
    
    CMD ["sh", "-c", "poetry run python manage.py migrate --no-input && poetry run python manage.py runserver 0.0.0.0:8000"]
    