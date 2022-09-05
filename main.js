const icons = {
    roku: 'connected_tv',
    ps5: 'sports_esports',
    recordplayer: 'album',
    switch: 'videogame_asset',
};

const roku_host = 'http://100.64.7.15';
const roku_port = 8060;

const esp_url = 'http://100.64.0.24:80';

const cors_proxy = 'http://100.64.10.124:8080/';

let is_roku_on = false;
let is_avr_on = false;
let current_volume = 70;
let current_source = 'roku';

const requestOptions = {
    method: 'POST',
    redirect: 'follow',
};

const requestOptionsGet = {
    method: 'GET',
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
    return await fetch(cors_proxy + esp_url + data, requestOptions);
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

getPowerStates();
getVolume();
getSource();
setInterval(getPowerStates, 15000);
setInterval(getSource, 15000);
setInterval(getVolume, 15000);

function getPowerStates() {
    getState('avr_on')
        .then((response) => response.text())
        .then((avr_on) => {
            if (avr_on == 'true') {
                is_avr_on = true;
                document.getElementById('avr-power').classList.add('power-on');
                document
                    .getElementById('avr-power')
                    .classList.remove('power-off');
            } else {
                is_avr_on = false;
                document.getElementById('avr-power').classList.add('power-off');
                document
                    .getElementById('avr-power')
                    .classList.remove('power-on');
            }
        });
    getState('roku_on')
        .then((response) => response.text())
        .then((roku_on) => {
            if (roku_on == 'true') {
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
        });
}

function getSource() {
    getState('source')
        .then((response) => response.text())
        .then((source) => {
            current_source = source;
            document.getElementById('current-icon').innerHTML =
                icons[current_source];
            for (const option of document.querySelectorAll('.custom-option')) {
                if (option.dataset.value == current_source) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            }
        });
}

function getVolume() {
    getState('volume')
        .then((response) => response.text())
        .then((volume) => {
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
        setPower('off')
            .then((response) => response.text())
            .then((power) => {
                if (power != 'Off') {
                    is_avr_on = true;
                } else {
                    is_avr_on = false;
                }
            });
        sendKey('PowerOff');
        sendCommand('/roku?state=off');
        is_roku_on = false;
    } else if (!is_avr_on && !is_roku_on) {
        setPower('on')
            .then((response) => response.text())
            .then((power) => {
                if (power != 'Off') {
                    is_avr_on = true;
                } else {
                    is_avr_on = false;
                }
            });
        sendKey('PowerOn');
        sendCommand('/roku?state=on');
        is_roku_on = true;
    }
};

document.getElementById('avr-power').onclick = () => {
    getPowerStates();
    if (is_avr_on) {
        setPower('off')
            .then((response) => response.text())
            .then((power) => {
                if (power != 'Off') {
                    is_avr_on = true;
                } else {
                    is_avr_on = false;
                }
            });
    } else {
        setPower('on')
            .then((response) => response.text())
            .then((power) => {
                if (power != 'Off') {
                    is_avr_on = true;
                } else {
                    is_avr_on = false;
                }
            });
    }
};

document.getElementById('roku-power').onclick = () => {
    getPowerStates();
    if (is_roku_on) {
        sendKey('PowerOff');
        sendCommand('/roku?state=off');
        is_roku_on = false;
    } else {
        sendKey('PowerOn');
        sendCommand('/roku?state=on');
        is_roku_on = true;
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
    setVolume(0)
        .then((response) => response.text())
        .then((volume) => {
            if (volume != 'Muted') {
                current_volume = volume;
            }
            document.getElementById('volume').value = volume;
        });
};

document.getElementById('volume-up').onclick = () => {
    getVolume();
    setVolume(current_volume + 2)
        .then((response) => response.text())
        .then((volume) => {
            if (volume != 'Muted') {
                current_volume = volume;
            }
            document.getElementById('volume').value = volume;
        });
};

document.getElementById('volume-down').onclick = () => {
    getVolume();
    setVolume(current_volume + 2)
        .then((response) => response.text())
        .then((volume) => {
            if (volume != 'Muted') {
                current_volume = volume;
            }
            document.getElementById('volume').value = volume;
        });
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
    sendKey('Select');
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

// toggle source dropdown
document
    .querySelector('.select-wrapper')
    .addEventListener('click', function () {
        document.body.classList.toggle('blur');
        this.querySelector('.selector').classList.toggle('open');
    });

// do things when each source is clicked
for (const option of document.querySelectorAll('.custom-option')) {
    option.addEventListener('click', function () {
        if (!this.classList.contains('selected')) {
            setSource(this.attributes[1].value)
                .then((response) => response.text())
                .then((source) => {
                    if (source === this.attributes[1].value) {
                        this.parentNode
                            .querySelector('.custom-option.selected')
                            .classList.remove('selected');
                        this.classList.add('selected');
                        document.getElementById('current-icon').innerHTML =
                            this.childNodes[1].innerHTML;
                    }
                });
        }
    });
}

// close dropdown when clicking outside
window.addEventListener('click', function (e) {
    const select = document.querySelector('.selector');
    if (!select.contains(e.target)) {
        select.classList.remove('open');
    }
});
