from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, \
     ForeignKey, event
from sqlalchemy.orm import scoped_session, sessionmaker, backref, relation
from sqlalchemy.ext.declarative import declarative_base

# from werkzeug import cached_property, http_date

# from flask import url_for, Markup
# from flask_website import app, search

db_url = "postgresql+psycopg2://postgres:12345678@localhost:5432/offlinepad"

# # db_url = postgresql+psycopg2://user:password@host:port/dbname[?key=value&key=value...]
# create_engine(db_url, client_encoding='utf8')

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)

#     def __repr__(self):
#         return '<User %r>' % self.username


engine = create_engine(db_url, client_encoding='utf8')


db_session = sessionmaker(autocommit=False,
                          autoflush=False,
                          bind=engine)()

def init_db():
    Model.metadata.create_all(bind=engine)


Model = declarative_base(name='Model')
# Model.query = db_session.query_property()


class PinCode(Model):
    __tablename__ = 'pin_code'
    id = Column('id', String, primary_key=True)
    secret_part = Column('secret_part', JSON)
    attempt = Column('attempt', Integer)
    pin = Column('pin', String)

if __name__ == "__main__":
    init_db()