# services/agents/Dockerfile

# Use Python 3.11 slim base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Set environment variables to prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy the requirements file into the container
COPY requirements.txt ./

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY ./app /usr/src/app/app

# Copy the YAML configuration files into the config directory
COPY ./app/agents.yaml /usr/src/app/config/agents.yaml
COPY ./app/tasks.yaml /usr/src/app/config/tasks.yaml

# Expose port 8000 for the FastAPI application
EXPOSE 8000

# Command to run the Uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]