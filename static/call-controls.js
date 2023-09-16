let muted = false;
let videoHide = false;

const muteBtn = document.getElementById("mute-audio");
const hideVid = document.getElementById("hide-video");
const endCall = document.getElementById("end-call");

muteBtn.addEventListener("click", () => {
  if (!muted) {
    muted = true;
    muteBtn.innerHTML = '<i class="fa fa-microphone-slash"></i>';
    room.localParticipant.audioTracks.forEach((trackPublication) => {
      trackPublication.track.disable();
    });
  } else {
    muted = false;
    muteBtn.innerHTML = '<i class="fa fa-microphone"></i>';
    room.localParticipant.audioTracks.forEach((trackPublication) => {
      trackPublication.track.enable();
    });
  }
});

hideVid.addEventListener("click", () => {
  if (!videoHide) {
    videoHide = true;
    hideVid.innerHTML = '<i class="fa fa-video-slash"></i>';
    room.localParticipant.videoTracks.forEach((trackPublication) => {
      trackPublication.trackName != "myscreenshare"
        ? trackPublication.track.disable()
        : undefined;
    });
  } else {
    videoHide = false;
    hideVid.innerHTML = '<i class="fa fa-video-camera"></i>';
    room.localParticipant.videoTracks.forEach((trackPublication) => {
      trackPublication.trackName != "myscreenshare"
        ? trackPublication.track.enable()
        : undefined;
    });
  }
});

endCall.addEventListener("click", () => {
  room.disconnect();
  window.location.reload();
});
