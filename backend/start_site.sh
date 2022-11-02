#!/bin/bash

source /home/offlinepad_app_back/offlinepad/backend/.env/bin/activate
exec gunicorn -w 2 -b 127.0.0.1:5000 run:app
