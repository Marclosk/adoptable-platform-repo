FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc

# Copiar archivos del proyecto
COPY pyproject.toml poetry.lock* ./

# Instalar Poetry
RUN pip install poetry

# Instalar dependencias del proyecto
RUN poetry install --no-root --only main

# Copiar el resto del código
COPY . .

CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
