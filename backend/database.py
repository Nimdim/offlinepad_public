from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, \
     ForeignKey, event
from sqlalchemy.orm import scoped_session, sessionmaker, backref, relation
from sqlalchemy.ext.declarative import declarative_base

db_session = None

def create_db_session(db_url, **kwargs):
    global db_session
    engine = create_engine(db_url, **kwargs)
    db_session = sessionmaker(autocommit=False,
                          autoflush=False,
                          bind=engine)()

def init_db(db_url):
    engine = create_engine(db_url)
    Model.metadata.create_all(bind=engine)


Model = declarative_base(name='Model')


class PinCode(Model):
    __tablename__ = 'pin_code'
    id = Column('id', String, primary_key=True)
    secret_part = Column('secret_part', JSON)
    attempt = Column('attempt', Integer)
    pin = Column('pin', String)
    type = Column('type', String)

if __name__ == "__main__":
    from settings import db_url
    init_db(db_url)