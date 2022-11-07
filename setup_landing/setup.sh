adduser --disabled-login offlinepad_landing
usermod -aG offlinepad_landing www-data

cd /home/offlinepad_landing
git clone https://github.com/Nimdim/offlinepad.git

cd offlinepad/landing
virtualenv .env
source .env/bin/activate

pip install -r requirements_production.txt
mkdir -p upload
chown offlinepad_landing:offlinepad_landing upload
chmod +x start_site.sh

cd ..

cp setup_landing/offlinepad_landing.service /etc/systemd/system/
systemctl enable offlinepad_landing.service

export db_password=`openssl rand -hex 32`
runuser -l postgres -c "psql -c \"create user offlinepad_landing with encrypted password '${db_password}';\""
runuser -l postgres -c 'psql -c "create database offlinepad_landing;"'
runuser -l postgres -c 'psql -c "grant all privileges on database offlinepad_landing to offlinepad_landing;"'

export secret_key=`openssl rand -hex 32`

cd landing

cat ../setup_landing/local_settings.py | \
  sed "s/DB_PASSWORD_PLACEHOLDER/${db_password}/g" | \
  sed "s/SECRET_KEY_PLACEHOLDER/${secret_key}/g" \
  > local_settings.py

python manage.py migrate
python manage.py collectstatic
service offlinepad_landing start

cp ../setup_landing/offlinepad_landing  /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/offlinepad_landing /etc/nginx/sites-enabled/offlinepad_landing
service nginx restart

certbot --nginx
