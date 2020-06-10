from database import db_session, PinCode
from datetime import datetime


def auth_check(func):
    def wrapper(id, pin):
        pin_info = db_session.query(PinCode).filter(PinCode.id == id).first()
        if pin_info:
            max_attempts = 3
            if pin_info.attempt < max_attempts:
                if pin_info.pin == pin:
                    return func(id, pin_info)
                else:
                    pin_info.attempt += 1
                    db_session.add(pin_info)
                    db_session.commit()
                    return {"error": {"msg": "wrong pin", "attempts": (max_attempts - pin_info.attempt)}}
            else:
                return {"error": "attempts exceeded"}
        else:
            return {"error": "invalid id"}
    return wrapper


def create(pin, secret):
    id = str(datetime.now().timestamp())
    pin = PinCode(id=id, secret_part=secret, pin=pin, attempt=0, type="4")
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
