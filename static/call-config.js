const callConfig = document.getElementById("call-config");
const closeConfig = document.getElementById("close-config-btn");
const callConfigDiv = document.getElementById("call-config-div");

const camSelectionDiv = document.getElementById("camera-selection");
const micSelectionDiv = document.getElementById("mic-selection");

let camDevice;
let micDevice;

const getDevices = async () => {
  const devices = [];
  const videoTracks = room.localParticipant["videoTracks"];
  videoTracks.forEach((videoTrack) => {
    //console.log(videoTrack);
    videoTrack["trackName"] != "myscreenshare"
      ? (camDevice = videoTrack["track"]["mediaStreamTrack"]["label"])
      : null;
  });
  const audioTracks = room.localParticipant["audioTracks"];
  audioTracks.forEach((audioTrack) => {
    micDevice = audioTrack["track"]["mediaStreamTrack"]["label"];
  });

  const mediaDevices = await navigator.mediaDevices.enumerateDevices();
  mediaDevices.forEach((mediaDevice) => {
    let camDevices = {};
    let micDevices = {};
    if (mediaDevice.kind === "videoinput") {
      camDevices["name"] = mediaDevice.label;
      camDevices["id"] = mediaDevice.deviceId;
      camDevices["kind"] = mediaDevice.kind;
      mediaDevice.label == camDevice
        ? (camDevices["active"] = true)
        : (camDevices["active"] = false);
      devices.push(camDevices);
    } else if (mediaDevice.kind == "audioinput") {
      micDevices["name"] = mediaDevice.label;
      micDevices["id"] = mediaDevice.deviceId;
      micDevices["kind"] = mediaDevice.kind;
      mediaDevice.label == micDevice
        ? (micDevices["active"] = true)
        : (micDevices["active"] = false);
      devices.push(micDevices);
    }
  });
  return devices;
};

const changeCamera = (deviceLabel, deviceId) => {
  camDevice = deviceLabel;
  let options = {
    deviceId: { exact: deviceId },
  };
  if (deviceLabel == "Back Camera") {
    options = { facingMode: "environment" };
  } else if (deviceLabel == "Front Camera") {
    options = { facingMode: "user" };
  }
  Twilio.Video.createLocalVideoTrack(options).then(function (localVideoTrack) {
    room.localParticipant.videoTracks.forEach((trackPublication) => {
      if (trackPublication.trackName != "myscreenshare") {
        const mediaElements = trackPublication.track.detach();
        trackPublication.track.stop();
        mediaElements.forEach((mediaElement) => mediaElement.remove());
        room.localParticipant.unpublishTrack(trackPublication.track);
      }
    });
    room.localParticipant.publishTrack(localVideoTrack);
  });
  callConfigDiv.style.display = "none";
};

const changeMic = (deviceId) => {
  Twilio.Video.createLocalAudioTrack({
    deviceId: { exact: deviceId },
  }).then(function (localAudioTrack) {
    room.localParticipant.audioTracks.forEach((trackPublication) => {
      const mediaElements = trackPublication.track.detach();
      mediaElements.forEach((mediaElement) => mediaElement.remove());
      room.localParticipant.unpublishTrack(trackPublication.track);
    });
    room.localParticipant.publishTrack(localAudioTrack);
  });
  callConfigDiv.style.display = "none";
};

callConfig.addEventListener("click", async () => {
  callConfigDiv.style.display = "block";
  camSelectionDiv.innerHTML = '<span class="d-block">Available Cameras</span>';
  micSelectionDiv.innerHTML =
    '<span class="d-block">Available Microphones</span>';
  const mediaDevices = await getDevices();
  //console.log(mediaDevices);
  mediaDevices.forEach((mediaDevice) => {
    if (mediaDevice.kind === "videoinput") {
      const camButton = document.createElement("button");
      camButton.innerText = mediaDevice.name;
      camButton.value = mediaDevice.id;
      camButton.classList = "btn btn-sm btn-outline-success m-1";
      mediaDevice.active ? camButton.classList.add("active") : null;
      camButton.addEventListener("click", () => {
        changeCamera(mediaDevice.name, mediaDevice.id);
      });
      camSelectionDiv.append(camButton);
    } else if (mediaDevice.kind === "audioinput") {
      const micButton = document.createElement("button");
      micButton.innerText = mediaDevice.name;
      micButton.value = mediaDevice.id;
      micButton.classList = "btn btn-sm btn-outline-success m-1";
      mediaDevice.active ? micButton.classList.add("active") : null;
      micButton.addEventListener("click", () => changeMic(mediaDevice.id));
      micSelectionDiv.append(micButton);
    }
  });
});

closeConfig.addEventListener("click", () => {
  callConfigDiv.style.display = "none";
});
