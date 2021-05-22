const axios = require("axios")

const getUsersCommunicationInfo = async (token) => {
    return axios
        .get('/users/communication-info', {
            headers: {
                token: `${token}`,
            },
        })
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            console.log(error.toJSON());
            return null
        });
}

const postPort = async (port, token) => {
    return axios
        .post('/users/communication-info', {
            port
        },
        {
            headers: {
                token: `${token}`,
            }
        })
        .then((response) => {
            return response
        })
        .catch((error) => {
            console.log(error)
            return null
        })
}

module.exports = {
    getUsersCommunicationInfo,
    postPort
}