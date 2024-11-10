# Usar una imagen base de Python
FROM python:3.10-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración de Poetry
COPY pyproject.toml poetry.lock* ./

# Instalar Poetry
RUN pip install poetry

# Instalar las dependencias del proyecto
RUN poetry install --no-root --only main

# Copiar el resto de los archivos del proyecto
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 8000

# Comando por defecto para ejecutar la aplicación
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
