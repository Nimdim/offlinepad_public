# import sqlalchemy

counter = 0
PINS = {}

def get_new_id():
    global counter
    counter += 1
    return counter


def auth_check(func):
    def wrapper(id, pin):
        if id in PINS:
            pin_info = PINS[id];
            if pin_info["attempts"] <= 3:
                if pin_info["pin"] == pin:
                    return func(id, pin)
                else:
                    pin_info["attempts"] += 1
            else:
                return {"error": "attempts exceeded"}
        return {"error": "invalid id or pin"}
    return wrapper


def create(pin, secret):
    id = get_new_id()
    PINS[id] = {
        "pin": pin,
        "secret": secret,
        "attempts": 0,
    }
    return {"error": "ok", "result": id}


@auth_check
def get(id, pin):
    pin_info = PINS[id];
    return {"error": "ok", "result": pin_info["secret"]}


@auth_check
def delete(id, pin):
    del PINS[id]
    return {"error": "ok"}
