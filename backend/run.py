from database import create_db_session
from settings import db_url
create_db_session(db_url)

from app import app

if __name__ == "__main__":
    app.run(debug=True)
