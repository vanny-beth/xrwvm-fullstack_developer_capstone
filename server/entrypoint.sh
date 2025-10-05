#!/bin/sh
# Make migrations and migrate the database.
echo "Making migrations and migrating the database."
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py collectstatic --noinput
exec gunicorn djangoproj.wsgi:application --bind 0.0.0.0:8000
