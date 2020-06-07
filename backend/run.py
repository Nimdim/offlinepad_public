from flask import Flask, request, jsonify
import pin_utils

app = Flask(__name__)

@app.route('/api/pin', methods=["POST"])
def create_pin():
    pin = request.form["pin"]
    secret = request.form["secret"]
    return jsonify(pin_utils.create(pin, secret))

@app.route('/api/pin/<id>', methods=["GET"])
def get_pin(id):
    pin = request.form["pin"]
    return jsonify(pin_utils.get(id, pin))

@app.route('/api/pin/<id>', methods=["DELETE"])
def delete_pin(id):
    pin = request.form["pin"]
    return jsonify(pin_utils.delete(id, pin))

app.run(debug=True)
