from database import db_session, PinCode
from datetime import datetime


def auth_check(func):
    def wrapper(id, pin):
        pin_info = db_session.query(PinCode).filter(PinCode.id == id).first()
        if pin_info:
            if pin_info.attempt <= 3:
                if pin_info.pin == pin:
                    return func(id, pin_info)
                else:
                    pin.attempt += 1
                    db_session.add(pin)
                    db_session.commit()
            else:
                return {"error": "attempts exceeded"}
        return {"error": "invalid id or pin"}
    return wrapper


def create(pin, secret):
    id = str(datetime.now().timestamp())
    pin = PinCode(id=id, secret_part=secret, pin=pin, attempt=0)
    db_session.add(pin)
    db_session.commit()
    return {"error": "ok", "result": id}


@auth_check
def get(id, pin):
    return {"error": "ok", "result": pin.secret_part}


@auth_check
def delete(id, pin):
    db_session.delete(pin)
    db_session.commit()
    return {"error": "ok"}
