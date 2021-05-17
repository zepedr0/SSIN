const axios = require("axios")

const getUsersCommunicationInfo = async (token) => {
    return axios
        .get(`${process.env.API_URL}/users/communication-info`, {
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
        .post(`${process.env.API_URL}/users/communication-info`, {
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
            console.log('Error: ', error.response.data.error)
            return null
        })
}

module.exports = {
    getUsersCommunicationInfo,
    postPort
}