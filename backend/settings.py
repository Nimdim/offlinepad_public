import os

db_url = "postgresql+psycopg2://postgres:12345678@localhost:5432/offlinepad"
db_sqlite_url = 'sqlite:///' + os.path.join(os.getcwd(), 'foo.db')

try:
    from local_settings import *
except ImportError:
    pass
