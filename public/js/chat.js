const socket = io();

const $messages = document.querySelector('#messages');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $messageForm = document.querySelector('#messageForm');
const $sendLocationButton = document.querySelector('#sendLocation');

// Templates
const sideBarTemplate = document.querySelector('#sideBarTemplate').innerHTML;
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML;

// Options
const { username, chat } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    const newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight;

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('chatData', ({ chat, users }) => {
    const hmtl = Mustache.render(sideBarTemplate, {
        chat,
        users
    });
    document.querySelector('#sidebar').innerHTML = hmtl;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log('Message delivered!');
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by yout navigator.');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            console.log('Location shared.');
            $sendLocationButton.removeAttribute('disabled');
        });
    });
});

socket.emit('join', { username, chat }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});