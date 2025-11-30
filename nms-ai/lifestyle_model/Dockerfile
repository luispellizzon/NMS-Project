FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files (app.py, csv, models, etc.)
COPY . .

# Create a directory for temporary model artifacts and give write permissions
RUN mkdir -p temp_artifacts && chmod -R 777 temp_artifacts
RUN chmod -R 777 /app

# Expose the port
EXPOSE 7860

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]