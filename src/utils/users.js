const users = [];

const addUser = ({ id, username, chat }) => {
    chat = chat.trim().toLowerCase();
    username = username.trim().toLowerCase();

    if (!username || !chat) {
        return {
            error: "Username and Chat are required"
        };
    }

    const existsUser = users.find((user) => user.chat === chat && user.username === username);

    if (existsUser) {
        return {
            error: 'Username is in use!'
        };
    }

    const user = { id, username, chat };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
};

const getUsersInChat = (chat) => {
    chat = chat.trim().toLowerCase();
    return users.filter((user) => user.chat === chat);
};

module.exports = { getUser, addUser, removeUser, getUsersInChat };