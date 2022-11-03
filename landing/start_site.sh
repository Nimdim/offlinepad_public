#!/bin/bash

source /home/offlinepad_landing/offlinepad/landing/.env/bin/activate
exec gunicorn offlinepad.asgi:application -w 2 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
