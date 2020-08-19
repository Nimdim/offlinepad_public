from flask import Flask, request, jsonify
import pin_utils

app = Flask(__name__)

@app.route('/api/pin', methods=["POST"])
def create_pin():
    data = request.json
    pin = data["pin"]
    secret = data["secret"]
    return jsonify(pin_utils.create(pin, secret))

@app.route('/api/pin/<id>', methods=["POST"])
def get_pin(id):
    data = request.json
    pin = data["pin"]
    return jsonify(pin_utils.get(id, pin))

@app.route('/api/pin/<id>', methods=["DELETE"])
def delete_pin(id):
    return jsonify(pin_utils.delete(id))

@app.route('/api/ping', methods=["POST"])
def ping():
    return jsonify({"ping": "ok"})
