# Use an official Python runtime as a parent image
FROM python:3.10

# Set the working directory in the container
WORKDIR /app

# Copy just the requirements file into the container
COPY requirements.txt .

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the current directory contents into the container at /app
COPY . .

# Expose the port your microservice will listen on
EXPOSE 5001

# Specify the command to run your Python script
CMD ["python", "get_ratios.py"]
