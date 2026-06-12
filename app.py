from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

TOTAL_NUMBERS = 6
MIN_NUMBER = 0
MAX_NUMBER = 9


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/start")
def start():

    numbers=[]

    for _ in range(TOTAL_NUMBERS):

        numbers.append(

            random.randint(
                MIN_NUMBER,
                MAX_NUMBER
            )

        )

    return jsonify({

        "success":True,

        "numbers":numbers

    })


@app.route("/health")
def health():

    return {

        "status":"UP"

    }


if __name__=="__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )