import Axios from "axios";

const checkUserType = (setUserType) => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    Axios.get(`${baseUrl}/api/imie`, { withCredentials: true })
        .then((response) => {
            setUserType(response.data.accountType);
        })
        .catch((error) => {
            console.error(error);
        });
};

export default checkUserType;