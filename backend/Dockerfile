FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc

COPY pyproject.toml poetry.lock* /app/

RUN pip install poetry

RUN poetry install --no-root 

COPY . /app/

CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
