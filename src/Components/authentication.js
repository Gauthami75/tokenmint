const axios = require('axios');
export const testAuthentication = () => {
    const url = `https://api.pinata.cloud/data/testAuthentication`;
    return axios
        .get(url, {
            headers: {
                'pinata_api_key': process.env.REACT_APP_PINATA_KEY,
                'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET
            }
        })
        .then(function (response) {
            //handle your response here
            console.log(response)
        })
        .catch(function (error) {
            //handle error here
            console.log(error)
        });
};

testAuthentication()