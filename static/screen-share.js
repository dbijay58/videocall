const screenShare = document.getElementById("screen-share");
let screenTrack = false;
screenShare.addEventListener("click", async () => {
  if (!screenTrack) {
    navigator.mediaDevices
      .getDisplayMedia({ video: { frameRate: 5 } })
      .then((stream) => {
        screenTrack = new Twilio.Video.LocalVideoTrack(stream.getTracks()[0], {
          name: "myscreenshare",
        });
        room.localParticipant.publishTrack(screenTrack);
        appActive = true;
        screenShare.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      })
      .catch((e) => {
        console.log(e);
        alert("Could not share the screen.");
      });
  } else {
    room.localParticipant.unpublishTrack(screenTrack);
    screenTrack.stop();
    screenShare.innerHTML = '<i class="fa-solid fa-arrow-up-from-bracket"></i>';
    appContainer.style.display = "none";
    appActive = false;
    screenTrack = false;
    resizeVideos();
  }
});
