window.AudioContext = window.AudioContext || window.webkitAudioContext

var audioContext = new AudioContext()
var audioInput = null,
  realAudioInput = null,
  inputPoint = null,
  audioRecorder = null
var analyserContext = null
var canvasWidth, canvasHeight
var recIndex = 0

function gotBuffers(buffers) {
  drawBuffer(buffers[0])
}

setInterval(() => {
  audioRecorder.record()
  setTimeout(() => {
    audioRecorder.stop()
    audioRecorder.getBuffers(gotBuffers)
    audioRecorder.clear()
  }, 900);
}, 1000);

function gotStream(stream) {
  inputPoint = audioContext.createGain()

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream)
  audioInput = realAudioInput
  audioInput.connect(inputPoint)
  
  analyserNode = audioContext.createAnalyser()
  analyserNode.fftSize = 2048
  inputPoint.connect(analyserNode)

  audioRecorder = new Recorder(inputPoint)

  zeroGain = audioContext.createGain()
  zeroGain.gain.value = 0.0
  inputPoint.connect(zeroGain)
  zeroGain.connect(audioContext.destination)
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
      setTimeout(() => {
        initAudio()
      }, 2000);
      console.log(e)
    })
}

window.addEventListener('load', initAudio)