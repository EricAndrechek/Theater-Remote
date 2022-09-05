const roku = 'connected_tv';
const ps5 = 'sports_esports';
const record_player = 'album';
const nintendo_switch = 'videogame_asset';

const roku_host = 'http://100.64.7.15';
const roku_port = 8060;

const esp_url = 'http://100.64.0.10:80';

const cors_proxy = 'http://100.64.10.124:8080/';

let is_roku_on = false;
let is_avr_on = false;
let current_volume = 70;
let current_source = 'Roku';

const requestOptions = {
    method: 'POST',
    redirect: 'follow',
};

// check that running on iPhone 13 or newer
if (
    !navigator.userAgent.includes('iPhone') ||
    parseInt(navigator.userAgent.split('iPhone OS ')[1].split(' ')[0]) < 15 ||
    window.innerWidth != 390 ||
    window.innerHeight != 844
) {
    document.body.classList.add('unsupported');
}

function sendCommand(data) {
    fetch(cors_proxy + esp_url + data, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log('error', error));
}

async function AsyncSendCommand(data) {
    await fetch(cors_proxy + esp_url + data, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log('error', error));
}

function sendButton(protocol, address, command, repeats) {
    sendCommand(
        '/send?protocol=' +
            protocol +
            '&address=' +
            address +
            '&command=' +
            command +
            '&repeats=' +
            repeats
    );
}

async function setPower(state) {
    return await AsyncSendCommand('/power?state=' + state);
}

async function setVolume(volume) {
    return await AsyncSendCommand('/volume?volume=' + volume);
}

async function setSource(source) {
    return await AsyncSendCommand('/source?source=' + source);
}

async function getState(variable) {
    return await AsyncSendCommand('/state?variable=' + variable);
}

function sendKey(key) {
    // POST send empty data to roku_host + ":" + roku_port + "/keypress/" + key
    fetch(
        cors_proxy + roku_host + ':' + roku_port + '/keypress/' + key,
        requestOptions
    )
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log('error', error));
}

function launchChannel(channel) {
    // POST send empty data to roku_host + ":" + roku_port + "/launch/" + channel
    fetch(
        cors_proxy + roku_host + ':' + roku_port + '/launch/' + channel,
        requestOptions
    )
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log('error', error));
}

// state requests

setInterval(getPowerStates, 15000);
setInterval(getVolume, 15000);

function getPowerStates() {
    getState('avr_on').then((avr_on) => {
        if (avr_on == 'true') {
            is_avr_on = true;
            document.getElementById('avr-power').classList.add('power-on');
            document.getElementById('avr-power').classList.remove('power-off');
        } else {
            is_avr_on = false;
            document.getElementById('avr-power').classList.add('power-off');
            document.getElementById('avr-power').classList.remove('power-on');
        }
    });
    // get roku_host + ":" + roku_port + "/query/device-info"
    // if response include <power-mode>PowerOn</power-mode> then is_roku_on = true
    fetch(
        cors_proxy + roku_host + roku_port + '/query/device-info',
        requestOptions
    )
        .then((response) => response.text())
        .then((result) => console.log(result))
        .then((result) => {
            if (result.includes('<power-mode>PowerOn</power-mode>')) {
                is_roku_on = true;
                document.getElementById('roku-power').classList.add('power-on');
                document
                    .getElementById('roku-power')
                    .classList.remove('power-off');
            } else {
                is_roku_on = false;
                document
                    .getElementById('roku-power')
                    .classList.add('power-off');
                document
                    .getElementById('roku-power')
                    .classList.remove('power-on');
            }
        })
        .catch((error) => console.log('error', error));
}

function getVolume() {
    getState('volume').then((volume) => {
        if (volume != 'Muted') {
            current_volume = volume;
        }
        document.getElementById('volume').value = volume;
    });
}

// OnClick handlers for every ID

document.getElementById('main-power').onclick = () => {
    // get states for avr_on and roku_on
    getPowerStates();
    if (is_avr_on && is_roku_on) {
        setPower('off');
        sendKey('PowerOff');
    } else if (!is_avr_on && !is_roku_on) {
        setPower('on');
        sendKey('PowerOn');
    }
};

document.getElementById('avr-power').onclick = () => {
    getPowerStates();
    if (is_avr_on) {
        setPower('off');
    } else {
        setPower('on');
    }
};

document.getElementById('roku-power').onclick = () => {
    getPowerStates();
    if (is_roku_on) {
        sendKey('PowerOff');
    } else {
        sendKey('PowerOn');
    }
};

document.getElementById('option').onclick = () => {
    sendKey('Info');
};

document.getElementById('back').onclick = () => {
    sendKey('Back');
};

document.getElementById('home').onclick = () => {
    sendKey('Home');
};

document.getElementById('mute').onclick = () => {
    getVolume();
    setVolume(0);
};

document.getElementById('volume-up').onclick = () => {
    getVolume();
    setVolume(current_volume + 2);
};

document.getElementById('volume-down').onclick = () => {
    getVolume();
    setVolume(current_volume + 2);
};

document.getElementById('rewind').onclick = () => {
    sendKey('InstantReplay');
};

document.getElementById('rewind').onclick = () => {
    sendKey('InstantReplay');
};

document.getElementById('up').onclick = () => {
    sendKey('Up');
};

document.getElementById('down').onclick = () => {
    sendKey('Down');
};

document.getElementById('right').onclick = () => {
    sendKey('Right');
};

document.getElementById('left').onclick = () => {
    sendKey('Left');
};

document.getElementById('ok').onclick = () => {
    sendKey('Ok');
};

document.getElementById('reverse').onclick = () => {
    sendKey('Rev');
};

document.getElementById('forward').onclick = () => {
    sendKey('Fwd');
};

document.getElementById('play-pause').onclick = () => {
    sendKey('Play');
};

document.getElementById('netflix').onclick = () => {
    launchChannel(12);
};

document.getElementById('disney-plus').onclick = () => {
    launchChannel(291097);
};

document.getElementById('apple-tv').onclick = () => {
    launchChannel(551012);
};

document.getElementById('espn').onclick = () => {
    launchChannel(34376);
};

document.getElementById('prime-video').onclick = () => {
    launchChannel(13);
};

document.getElementById('adult-swim').onclick = () => {
    launchChannel(187665);
};

document.getElementById('youtube').onclick = () => {
    launchChannel(837);
};

document.getElementById('jellyfin').onclick = () => {
    launchChannel(592369);
};

document.getElementById('peacock').onclick = () => {
    launchChannel(593099);
};

document.getElementById('f1').onclick = () => {
    launchChannel(285646);
};

document.getElementById('hbo-max').onclick = () => {
    launchChannel(61322);
};

document.getElementById('spotify').onclick = () => {
    launchChannel(22297);
};

document.getElementById('apple-music').onclick = () => {
    launchChannel(637193);
};

document.getElementById('hulu').onclick = () => {
    launchChannel(2285);
};
