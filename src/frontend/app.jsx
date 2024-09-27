const { useRef, useEffect, useState } = React;

const baseURL = "" // points to whatever is serving this app (eg your -dev.modal.run for modal serve, or .modal.run for modal deploy)

const getBaseURL = () => {
  // return "wss://erik-dunteman--quillman-moshi-web-dev.modal.run/ws"; // temporary erik!

  // use current web app server domain to construct the url for the moshi app
  const currentURL = new URL(window.location.href);
  let hostname = currentURL.hostname;
  hostname = hostname.replace('-web', '-moshi-web');
  const wsProtocol = currentURL.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${hostname}/ws`; 
}

const App = () => {
  const socketRef = useRef(null);
  const [recorder, setRecorder] = useState(null);
  const [completedSentences, setCompletedSentences] = useState([]);
  const [pendingSentence, setPendingSentence] = useState('');
  const [warmupComplete, setWarmupComplete] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  // start recording
  const startRecording = async () => {
    // used to get permission to use microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new Recorder({
      encoderPath: "https://cdn.jsdelivr.net/npm/opus-recorder@latest/dist/encoderWorker.min.js",
      streamPages: true,
      encoderApplication: 2049,
      encoderFrameSize: 80, // milliseconds, equal to 1920 samples at 24000 Hz
      encoderSampleRate: 24000,  // 24000 to match model's sample rate
      maxFramesPerPage: 1,
      numberOfChannels: 1,
    });

    recorder.ondataavailable = async (arrayBuffer) => {
      if (socketRef.current) {
        if (socketRef.current.readyState !== WebSocket.OPEN) {
          console.log("Socket not open, dropping audio");
          return;
        }
        await socketRef.current.send(arrayBuffer);
      }
    };

    recorder.start().then(() => {
      console.log("Recording started");
      setRecorder(recorder);
    });

    // create a MediaRecorder object for capturing PCM (calculating amplitude)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    const sourceNode = audioContext.createMediaStreamSource(stream);
    sourceNode.connect(analyzer);
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = async (event) => {
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAmplitude(average);
    };
    mediaRecorder.start(10);

  };

  // open websocket connection
  useEffect(() => {

    // startRecording(); // temporary erik!
    // return; // temporary erik!

    const endpoint = getBaseURL();
    console.log("Connecting to", endpoint);
    const socket = new WebSocket(endpoint);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection opened");
      startRecording();
      setWarmupComplete(true);
    };

    socket.onmessage = async (event) => {
      // data is a blob, convert to array buffer
      const arrayBuffer = await event.data.arrayBuffer();
      const view = new Uint8Array(arrayBuffer);
      const tag = view[0];
      const payload = arrayBuffer.slice(1);
      if (tag === 1) {
        // audio data
        // console.log("Received audio data", payload.byteLength, "bytes");
      }
      if (tag === 2) {
        // text data
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);

        setPendingSentence(prevPending => {
          const updatedPending = prevPending + text;
          if (updatedPending.endsWith('.') || updatedPending.endsWith('!') || updatedPending.endsWith('?')) {
            setCompletedSentences(prevCompleted => [...prevCompleted, updatedPending]);
            return '';
          }
          return updatedPending;
        });
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-xl p-6">
        <div className="flex">
          <div className="w-5/6 overflow-y-auto max-h-64">
            <TextOutput warmupComplete={warmupComplete} completedSentences={completedSentences} pendingSentence={pendingSentence} />
          </div>
          <div className="w-1/6 ml-4 px-2">
            <AudioControl recorder={recorder} amplitude={amplitude} />
          </div>
        </div>
      </div>
    </div>
  );
}

const AudioControl = ({ recorder, amplitude }) => {
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    setMuted(!muted);
    recorder.setRecordingGain(muted ? 1 : 0);
  };

  const amplitudePercent = amplitude / 255;
  const maxAmplitude = 0.3; // for scaling
  const minDiameter = 20; // minimum diameter of the circle in pixels
  const maxDiameter = 200; // increased maximum diameter to ensure overflow
  
  var diameter = minDiameter + (maxDiameter - minDiameter) * (amplitudePercent / maxAmplitude);
  if (muted) {
    diameter = 20;
  }

  return (
    <div className="w-full h-full flex items-center">
      <div className="w-full h-6 rounded-md relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full transition-all duration-100 ease-out hover:cursor-pointer ${muted ? 'bg-gray-200' : 'bg-green-400'}`}
            onClick={toggleMute}
            style={{
              width: `${diameter}px`,
              height: `${diameter}px`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const TextOutput = ({ warmupComplete, completedSentences, pendingSentence }) => {
  const containerRef = useRef(null);
  const allSentences = [...completedSentences, pendingSentence];
  if (pendingSentence.length === 0 && allSentences.length > 1) {
    allSentences.pop();
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [completedSentences, pendingSentence]);

  return (
    <div ref={containerRef} className="flex flex-col-reverse overflow-y-auto max-h-64">
      {warmupComplete ? (
        allSentences.map((sentence, index) => (
          <p key={index} className="text-gray-300 my-2">{sentence}</p>
        )).reverse()
      ) : (
        <p className="text-gray-400 animate-pulse">Warming up model...</p>
      )}
    </div>
  );
};



const container = document.getElementById("react");
ReactDOM.createRoot(container).render(<App />);