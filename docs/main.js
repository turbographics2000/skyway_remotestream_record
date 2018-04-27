const peer = new Peer({ key: 'cc1edbd6-1f11-48ab-9680-f2a5f74633b4' });
let myId = null;
let remoteId = null;
let localStream = null;
let remoteStream = null;
let mediaConnection = null;
let mediaRecorder = null;
let recordChunks = [];
const snapshotCnv = document.createElement('canvas');
const snapshotCtx = snapshotCnv.getContext('2d');
btnConnect.disabled = btnRecord.disabled = btnSnapshot.disabled = true;

peer.on('open', id => {
    myId = id;
    peer.listAllPeers(peers => {
        remoteId = peers.filter(peerId => peerId !== myId)[0];
        if (remoteId) {
            btnConnect.disabled = false;
        }
    })
});

peer.on('call', async call => {
    if (!localStream) {
        await getLocalStream();
    }
    call.answer(localStream);
    callEventHandler(call);
});

btnConnect.onclick = async evt => {
    await getLocalStream();
    call = peer.call(remoteId, localStream);
    callEventHandler(call);
};

async function getLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
        localView.srcObject = localStream;
        localView.play();
    } catch (err) {
        console.log(err);
    }
}

function callEventHandler(call) {
    call.on('stream', async stream => {
        remoteStream = stream;
        remoteView.srcObject = stream;
        remoteView.play();
        btnRecord.disabled = false;
    });
}

btnRecord.onclick = evt => {
    if (btnRecord.textContent === 'record') {
        btnRecord.textContent = 'stop';
        recordChunks = [];
        mediaRecorder = new MediaRecorder(remoteStream);
        mediaRecorder.ondataavailable = evt => {
            chunks.push(evt.data);
        };
        mediaRecorder.onstop = evt => {
            const blob = new Blob(chunks);
            recordView.src = URL.createObjectURL(blob);
        };
        mediaRecorder.start();
    } else if (btnRecord.textContent === 'stop') {
        btnRecord.textContent = 'record';
        mediaRecorder.stop();
    }
};