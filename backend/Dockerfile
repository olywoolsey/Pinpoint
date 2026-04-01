# Use an official Python runtime as a parent image
FROM python:latest

# Set the working directory in the container
WORKDIR /app

# requirements.txt is copied before the rest of the application to take advantage of Docker layer caching.
# If requirements.txt hasn't changed, Docker will use the cached layer and skip the pip install step.
COPY requirements.txt ./

# Here, we break the cache if requirements.txt has changed, ensuring that we only reinstall packages when needed.
RUN pip install --no-cache-dir -r requirements.txt

# Now we copy the rest of our application into the container.
# This is done after installing dependencies to ensure that application changes don't trigger a full reinstall of packages.
COPY . .

# Make port 5000 available outside this container
EXPOSE 5000

# Define environment variable for Flask to locate the application
ENV FLASK_APP=run.py
ENV FLASK_ENV=development
ENV FLASK_RUN_HOST=0.0.0.0

# Run the application
CMD ["flask", "run"]

# Production stage
# Uncomment the following lines for a production build
# FROM python:latest as production
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install -r requirements.txt gunicorn
# COPY . .
# EXPOSE 5000
# CMD ["gunicorn", "-b", "0.0.0.0:5000", "Pinpoint:app"]