let isPlaying = false;
const audioElement = new Audio;
const pressButton = document.getElementById("playButton");
const playIcon = '\u25B6'; // Unicode character for right-pointing triangle
const pauseIcon = 'I I';


pressButton.textContent = playIcon;




//  OpenAI 
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: "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" });
const openai = new OpenAIApi(configuration);

// Music mapping
const musicMapping = {
    '1. Грустная': 'sad.mp3',
    '2. Веселая': 'happy.mp3',
    '3. Епическая': 'epic.mp3', 
    '3. Епическая музыка': 'epic.mp3',
    '4. Жуткая': 'creepy.mp3',
    '5. Романтическая': 'romantic.mp3',
    '6. Таинственная': 'mystery.mp3'
};

// Function to run the speech recognition. (openai request, and playing music) are within the function 

runSpeechRecog = () => {
    console.log("Button clicked!"); // Check if the button click event is detected
    document.getElementById("output").innerHTML = "Loading text...";
    var output = document.getElementById('output');
    var action = document.getElementById('action');
    var num_words = 0;
    let recognization = new webkitSpeechRecognition();
    recognization.continuous = true;
    recognization.interimResults = false;
    recognization.lang = "ru-RU";

    switch (isPlaying) {
        case true:
            console.log("Stopping speech recognition"); // Check if recognition stop is triggered
            maxDuration = 0;
            recognization.stop();
            if (isPlaying) {
                console.log("Pausing music"); // Check if music pause is triggered
                audioElement.pause();
                isPlaying = false;
            }
            break;
        case false:
            console.log("Starting speech recognition"); // Check if recognition start is triggered
            recognization.start();
            if (!isPlaying) {
                audioElement.play();
                isPlaying = true;
            }
            break;
    }
    
    recognization.onstart = () => {
        action.innerHTML = "Listening...";
    }
    recognization.onaudiostart = () =>{
        pressButton.textContent = pauseIcon;
        isPlaying = true;
        localStorage.setItem('microphonePermission', 'granted');
        const maxDuration = 15000; // 15 seconds
            setTimeout(() => {
                recognization.stop();
            }, maxDuration);
    }
    recognization.onresult = async (e) => {
        var transcript = e.results[0][0].transcript;
        output.innerHTML = transcript;
        var words = transcript.split(" ");
        var num_words = words.length;

        // Sending request to OpenAI using the transcribed text
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `${transcript} Прочитай предложение и определи настроение музыки - 1. Грустная музыка, 2. Веселая музыка, 3. Епическая музыка, 4. Жуткая музыка 5. Романтическая музыка. 6. Таинственная музыка .Используй эти параметры: 1. Ответ одним словом.`
            },],
            temperature: 0,
            max_tokens: 500,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
    
        console.log(response.data.choices[0].message); // Getting response from chatGPT in console

        const responseContent = response.data.choices[0].message.content;
        const musicFile = musicMapping[responseContent]; // Find a music file name in the mapping

        //Audio Visualizer
        
        

        const container = document.getElementById('container');
        const canvas = document.getElementById('canvas1');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        let audioSource
        let analyser;

        container.addEventListener('click', function(){

        })
        

        if (musicFile) {
            // Play the corresponding music file
            audioElement.src = `assets/${musicFile}`;

            container.addEventListener('click', function(){
                let audioElement = new Audio;
                const audioContext = new AudioContext();
                audioElement.play();
                audioSource = audioContext.createMediaElementSource(audioElement);
                analyser = audioContext.createAnalyser();
                audioSource.connect(analyser);
                analyser.connect(audioContext.destination);
                analyser.fftSize = 64;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const barWidth = canvas.width/bufferLength;
                let barHeight;
                let x;

                function animate(){
                    x = 0;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    analyser.getByteFrequencyData(dataArray);
                    for(let i = 0; i < bufferLength; i++){
                        barHeight = dataArray[i];
                        ctx.fillStyle = 'white';
                        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                        x += barWidth;
                    }

                    requestAnimationFrame(animate);

                }
                animate();
            });

        } else {
            // Error massage in case music don't match
            console.log("Music not found", responseContent);
            
        }
    };
    recognization.onend = () => {
        pressButton.textContent = playIcon;
        output.classList.remove("hide")
        action.innerHTML = "";
        isPlaying = false;
    }
    
};



 module.exports = { runSpeechRecog };


