const raiseHandBtn = document.getElementById("raise-hand");
let handRaised = false;
let handRaiseSpan;

raiseHandBtn.addEventListener("click", () => {
    if (!handRaised) {
        gestureTrack.send(JSON.stringify({action: 'handraise', raiseLower: 'raise'}));
        handRaised = true;
        raiseHand('local', 'raise');
        raiseHandBtn.style.color = 'orange';
    } else {
        gestureTrack.send(JSON.stringify({action: 'handraise', raiseLower: 'lower'}));
        handRaised = false;
        raiseHand('local', 'lower');
        raiseHandBtn.style.color = '';
    }
})

const raiseHand = (participant, raiseLower) => {
    if (raiseLower == 'lower' && participant != 'local') {
        handRaiseSpan = document.getElementById(participant + '-hand-raise');
        handRaiseSpan.remove();
    } else {
        if (participant != 'local') {
            const handRaiser = document.getElementById(participant);
            handRaiseSpan = document.createElement('span');
            handRaiseSpan.id = participant + '-hand-raise';
            handRaiseSpan.innerHTML = '<i class="fa-solid fa-hand"></i>';
            handRaiseSpan.className = 'hand-raise-span';
            handRaiser.append(handRaiseSpan);
        }
    }
}