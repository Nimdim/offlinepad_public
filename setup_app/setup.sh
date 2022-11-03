# app
adduser --disabled-login offlinepad_app_front
usermod -aG offlinepad_app_front www-data

# backend
adduser --disabled-login offlinepad_app_back
usermod -aG offlinepad_app_back www-data

cd /home/offlinepad_app_back
git clone https://github.com/Nimdim/offlinepad.git

cd offlinepad/backend
virtualenv .env
source .env/bin/activate

pip install -r requirements_production.txt
chmod +x start_site.sh

cd ..

cp setup_app/offlinepad_app_back.service /etc/systemd/system/
systemctl enable offlinepad_app_back.service

export db_password=`openssl rand -hex 32`
runuser -l postgres -c "psql -c \"create user offlinepad_app_back with encrypted password '${db_password}';\""
runuser -l postgres -c 'psql -c "create database offlinepad_app_back;"'
runuser -l postgres -c 'psql -c "grant all privileges on database offlinepad_app_back to offlinepad_app_back;"'

service offlinepad_app_back start

# common
cp setup/offlinepad_app  /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/offlinepad_app /etc/nginx/sites-enabled/offlinepad_app
service nginx restart

certbot --nginx
