from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

TOTAL_NUMBERS = 6
MIN_NUMBER = 1
MAX_NUMBER = 99


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/start")
def start():

    numbers = random.sample(
        range(
            MIN_NUMBER,
            MAX_NUMBER + 1
        ),
        TOTAL_NUMBERS
    )

    return jsonify({
        "success": True,
        "numbers": numbers
    })


@app.route("/health")
def health():
    return {
        "status": "UP"
    }


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )