# Usa la imagen base de Python 3.10 slim
FROM python:3.10-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 y otras librerías de Python
RUN apt-get update && apt-get install -y libpq-dev gcc

# Copiar los archivos de dependencias (esto aprovecha la caché de Docker si no cambian)
COPY pyproject.toml poetry.lock* /app/

# Instalar Poetry
RUN pip install poetry

# Instalar las dependencias del proyecto (principalmente las necesarias para la aplicación)
RUN poetry install --no-dev --only main

# Copiar el resto del código del proyecto
COPY . /app/

# Establecer el comando predeterminado para ejecutar el servidor de Django
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
