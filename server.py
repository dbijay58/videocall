import os

import twilio.jwt.access_token
import twilio.jwt.access_token.grants
import twilio.rest
from dotenv import load_dotenv
from flask import Flask, render_template, request

load_dotenv()

account_sid = os.environ["TWILIO_ACCOUNT_SID"]
api_key = os.environ["TWILIO_API_KEY_SID"]
api_secret = os.environ["TWILIO_API_KEY_SECRET"]
twilio_client = twilio.rest.Client(api_key, api_secret, account_sid)

app = Flask(__name__)


def find_or_create_room(room_name):
    try:
        twilio_client.video.rooms(room_name).fetch()
    except:
        twilio_client.video.rooms.create(unique_name=room_name, type="go")

def get_access_token(room_name, participant_name):
    access_token = twilio.jwt.access_token.AccessToken(
        account_sid, api_key, api_secret, identity=participant_name
    )
    video_grant = twilio.jwt.access_token.grants.VideoGrant(room=room_name)
    access_token.add_grant(video_grant)
    return access_token


@app.route("/")
def serve_homepage():
    return render_template("index.html")


@app.route("/join-room", methods=["POST"])
def join_room():
    room_name = request.json.get("room_name")
    participant_name = request.json.get("participant_name")
    try:
        find_or_create_room(room_name)
        access_token = get_access_token(room_name, participant_name)
        return {"token": access_token.to_jwt()}
    except:
        return {"error": "could not find room"}

@app.route("/create-room", methods=["POST"])
def new_room():
    room_name = request.json.get("room_name")
    try:
        create_room(room_name)
        access_token = get_access_token(room_name)
        return {"token": access_token.to_jwt()}
    except:
        return {"error": "could not find room"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5050", debug=True)