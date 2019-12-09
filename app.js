window.AudioContext = window.AudioContext || window.webkitAudioContext

var audioContext = new AudioContext()
var audioInput = null,
  realAudioInput = null,
  inputPoint = null,
  audioRecorder = null
var rafID = null
var analyserContext = null
var canvasWidth, canvasHeight
var recIndex = 0

/* TODO:
- offer mono option
- "Monitor input" switch
*/

function saveAudio() {
  audioRecorder.exportWAV(doneEncoding)
  // could get mono instead by saying
  // audioRecorder.exportMonoWAV( doneEncoding )
}

function gotBuffers(buffers) {
  drawBuffer(buffers[0])
  // drawBuffer(buffers[1])
  //buffers[0] == left && buffers[1] == right 
}

setInterval(() => {
  audioRecorder.record()
  setTimeout(() => {
    audioRecorder.stop()
    audioRecorder.getBuffers(gotBuffers)
    audioRecorder.clear()
  }, 500);
}, 1000);

function cancelAnalyserUpdates() {
  window.cancelAnimationFrame(rafID)
  rafID = null
}

const colorArray = []
const clear = () => colorArray.splice(0, colorArray.length)

// setInterval(() => changeLights(colorArray), 1000);

function updateAnalysers(time) {
  clear()
  const SPACING = 5
  const numBars = Math.round(canvasWidth / SPACING)

  let freqByteData = new Uint8Array(analyserNode.frequencyBinCount)
  analyserNode.getByteFrequencyData(freqByteData)
  const multiplier = analyserNode.frequencyBinCount / numBars
  // Draw rectangle for each frequency bin.
  for (let i = 0; i < numBars; ++i) {
    let magnitude = 0
    let offset = Math.floor(i * multiplier)
    // gotta sum/average the block, or we miss narrow-bandwidth spikes
    for (let j = 0; j < multiplier; j++)
      magnitude += freqByteData[offset + j]
    

    magnitude = magnitude / multiplier
    colorArray.push({
      color: i > 40 ? 'red' : i > 20 ? 'green' : 'blue',
      magnitude
    })
  }

  rafID = window.requestAnimationFrame(updateAnalysers)
}

function toggleMono() {
  if (audioInput != realAudioInput) {
    audioInput.disconnect()
    realAudioInput.disconnect()
    audioInput = realAudioInput
  } else {
    realAudioInput.disconnect()
    audioInput = convertToMono(realAudioInput)
  }

  audioInput.connect(inputPoint)
}



function gotStream(stream) {
  inputPoint = audioContext.createGain()

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream)
  audioInput = realAudioInput
  audioInput.connect(inputPoint)

  //    audioInput = convertToMono( input )

  analyserNode = audioContext.createAnalyser()
  analyserNode.fftSize = 2048
  inputPoint.connect(analyserNode)

  audioRecorder = new Recorder(inputPoint)

  zeroGain = audioContext.createGain()
  zeroGain.gain.value = 0.0
  inputPoint.connect(zeroGain)
  zeroGain.connect(audioContext.destination)

  updateAnalysers()
}

function initAudio() {
  if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
  if (!navigator.cancelAnimationFrame)
    navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame
  if (!navigator.requestAnimationFrame)
    navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame

  navigator.getUserMedia(
    {
      "audio": {
        "mandatory": {
          "googEchoCancellation": "false",
          "googAutoGainControl": "false",
          "googNoiseSuppression": "false",
          "googHighpassFilter": "false"
        },
        "optional": []
      },
    }, gotStream, function (e) {
      alert('Error getting audio')
      console.log(e)
    })
}

window.addEventListener('load', initAudio) 