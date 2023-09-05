# Use an official Python runtime as a parent image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Copy the rest of your app's source code
COPY . .

# Expose the port your Flask app runs on
EXPOSE 8000

# Define environment variables
# ENV FLASK_APP=stock_data_microservice.py
# ENV FLASK_RUN_HOST=0.0.0.0

# Run your Flask app
CMD ["python", "stock_data_microservice.py"]

