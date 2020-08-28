import os
from database import create_db_session, init_db
from settings import db_sqlite_url

os.remove("foo.db")
init_db(db_sqlite_url)
create_db_session(db_sqlite_url, connect_args={'check_same_thread': False})


from app import app

if __name__ == "__main__":
    app.run(debug=False, port=4999)
