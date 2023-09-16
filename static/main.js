const form = document.getElementById("room-name-form");
const passCode = document.getElementById("passcode");

const container = document.getElementById("video-container");
const appContainer = document.getElementById("app-container");
const userControls = document.getElementById("user-controls");

const whiteBoardTrack = new Twilio.Video.LocalDataTrack({
  name: "mywhiteboard",
});

const chatDataTrack = new Twilio.Video.LocalDataTrack({ name: "mychattrack" });

const gestureTrack = new Twilio.Video.LocalDataTrack({ name: "mygesturetrack" });

const roomName = "kathmandu1";
let room;
//screen controls below
const width = 640;
const height = 480;
const hdWidth = 1920;
const hdHeight = 1080;

let aR = width / height;
let hdActive = false;
let vidHeight = height;
let vidWidth = width;
let rows = 1;
let columns = 1;

//audio video track control below
let appActive = false;
let participants = 0;

const startRoom = async (event) => {
  event.preventDefault();
  form.style.visibility = "hidden";
  const displayName = document.getElementById("participant_display_name").value;
  const response = await fetch("/join-room", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room_name: roomName,
      participant_name: displayName,
    }),
  });
  const { token } = await response.json();
  room = await joinVideoRoom(roomName, token);
  handleConnectedParticipant(room.localParticipant);
  room.participants.forEach(handleConnectedParticipant);
  room.on("participantConnected", handleConnectedParticipant);
  room.on("participantDisconnected", handleDisconnectedParticipant);
  window.addEventListener("pagehide", () => room.disconnect());
  window.addEventListener("beforeunload", () => room.disconnect());
};

const handleConnectedParticipant = (participant) => {
  participants++;
  userControls.style.display = "flex";
  // create a div for this participant's tracks
  const participantDiv = document.createElement("div");
  const participantName = document.createElement("span");
  participantName.innerText = participant.identity;
  participantName.className = "participant-name";
  participantDiv.append(participantName);
  participantDiv.className = "participant-div";
  participantDiv.setAttribute("id", participant.identity);
  container.appendChild(participantDiv);

  // iterate through the participant's published tracks and
  // call `handleTrackPublication` on them
  participant.tracks.forEach((trackPublication) => {
    handleTrackPublication(trackPublication, participant);
  });

  // listen for any new track publications
  participant.on("trackPublished", (publishedTrack) => {
    handleTrackPublication(publishedTrack, participant);
  });
  participant.on("trackUnpublished", (publishedTrack) => {
    handleTrackUnpublication(publishedTrack, participant);
  });
  participant.on("trackSubscribed", (subscribedTrack) => {
    handleTrackSubscription(subscribedTrack, participant);
  });

  resizeVideos();
};

const handleDisconnectedParticipant = (participant) => {
  // stop listening for this participant
  participant.removeAllListeners();
  // remove this participant's div from the page
  const participantDiv = document.getElementById(participant.identity);
  participantDiv.remove();
  participants--;
  resizeVideos();
};

const handleTrackPublication = (trackPublication, participant) => {
  //console.log(trackPublication, participant);
  if (trackPublication.trackName == "myscreenshare") {
    appContainer.innerHTML = "";
    setTimeout(() => {
      const screenDiv = document.createElement("div");
      screenDiv.className = "screen-div";
      screenDiv.append(trackPublication.track.attach());
      appContainer.innerHTML = "";
      appContainer.append(screenDiv);
      appContainer.style.display = "block";
      resizeVideos("screenshare");
      appActive = true;
    }, 2000);
  } else if (
    trackPublication.kind == "video" ||
    trackPublication.kind == "audio"
  ) {
    function displayTrack(track) {
      // append this track to the participant's div and render it on the page
      const participantDiv = document.getElementById(participant.identity);
      // track.attach creates an HTMLVideoElement or HTMLAudioElement
      // (depending on the type of track) and adds the video or audio stream
      const trackElement = track.attach();
      trackElement.id = track.sid;
      participantDiv.append(trackElement);
    }

    // check if the trackPublication contains a `track` attribute. If it does,
    // we are subscribed to this track. If not, we are not subscribed.
    if (trackPublication.track) {
      displayTrack(trackPublication.track);
    }

    // listen for any new subscriptions to this track publication
    trackPublication.on("subscribed", displayTrack);
  }
};

const handleTrackUnpublication = (trackPublication, participant) => {
  //console.log('unpublish', trackPublication, participant);
  if (trackPublication.trackName === "myscreenshare") {
    appContainer.style.display = "none";
    appActive = false;
  } else {
    const mediaElement = document.getElementById(trackPublication.trackSid);
    mediaElement.remove();
  }
  resizeVideos();
};

const handleTrackSubscription = (subscribedTrack, participant) => {
  console.log(subscribedTrack);
  if (subscribedTrack.kind == "data" && subscribedTrack.name == "mychattrack") {
    subscribedTrack.on("message", (data) => {
      chatBox.style.color = "darkorange";
      const incomingMsg = document.createElement("div");
      const message = document.createElement("span");
      const sender = document.createElement("span");
      incomingMsg.className = "incoming-message";
      sender.className = "message-sender";
      message.innerHTML = data;
      sender.innerHTML = participant.identity;
      incomingMsg.append(sender, message);
      chatDisplay.append(incomingMsg);
    });
  } else if (
    subscribedTrack.kind == "data" &&
    subscribedTrack.name == "mywhiteboard"
  ) {
    console.log(subscribedTrack);
    subscribedTrack.on("message", (data) => {
      if (data == "start-whiteboard") {
        startWhiteBoard();
        whiteBoardActive = true;
      } else if (data == "end-whiteboard") {
        appContainer.style.display = "none";
        appActive = false;
        whiteBoardActive = true;
        resizeVideos();
      } else {
        const parsedData = JSON.parse(data);
        const ratioH = parsedData.canvasH / canvas.height;
        const ratioW = parsedData.canvasW / canvas.width;
        draw(
          parsedData.x / ratioW,
          parsedData.y / ratioH,
          parsedData.x1 / ratioW,
          parsedData.y1 / ratioH,
          parsedData.thickness,
          parsedData.color
        );
      }
    });
  } else if (
    subscribedTrack.kind == "data" &&
    subscribedTrack.name == "mygesturetrack"
  ) {
    subscribedTrack.on("message", (data) => {
      const parsedData = JSON.parse(data);
      if (parsedData.action == 'handraise') {
        raiseHand(participant.identity, parsedData.raiseLower);
      }
    })
  }
};

const joinVideoRoom = async (roomName, token) => {
  const localAudioTrack = await Twilio.Video.createLocalAudioTrack();
  const localVideoTrack = await Twilio.Video.createLocalVideoTrack({
    height: height,
    frameRate: 24,
    width: width,
  });
  const tracks = [
    localAudioTrack,
    localVideoTrack,
    chatDataTrack,
    whiteBoardTrack,
    gestureTrack
  ];
  // join the video room with the Access Token and the given room name
  const room = await Twilio.Video.connect(token, {
    room: roomName,
    tracks: tracks,
    bandwidthProfile: {
      video: {
        mode: "grid",
        dominantSpeakerPriority: "standard",
      },
    },
    dominantSpeaker: true,
    maxAudioBitrate: 16000, //For music remove this line
    preferredVideoCodecs: [{ codec: "VP8", simulcast: true }],
    networkQuality: { local: 1, remote: 1 },
  });
  return room;
};

const resizeVideos = (action) => {
  const partDiv = document.getElementsByClassName("participant-div");
  const participants = partDiv.length;
  const partArray = [...partDiv];
  if (action == "screenshare" || action == "whiteboard") {
    container.className = "container-app-active";
    vidHeight = container.clientHeight;
    vidWidth = aR * vidHeight;
  } else if (!appActive) {
    container.className = "video-container";
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (participants == 1) {
      rows = 1;
      columns = 1;
      vidWidth = containerW;
      vidHeight = vidWidth / aR;
      if (vidHeight > containerH) {
        vidHeight = containerH;
        vidWidth = vidHeight * aR;
      }
    } else {
      if (
        participants > rows * columns &&
        containerH - rows * (vidHeight + 2) >= vidHeight
      ) {
        rows++;
      }
      action == "remove" ? rows-- : undefined;
      columns = Math.ceil(participants / rows);
      vidWidth = containerW / columns - 3;
      vidHeight = vidWidth / aR;
      if (rows * (vidHeight + 2) >= containerH) {
        vidHeight = containerH / rows - 2;
        vidWidth = vidHeight * aR;
      }
    }
  }
  partArray.forEach((videoDiv) => {
    videoDiv.style.width = vidWidth + "px";
    videoDiv.style.height = vidHeight + "px";
  });
};

form.addEventListener("submit", startRoom);
window.addEventListener("resize", resizeVideos);
