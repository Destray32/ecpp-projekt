import Axios from "axios";

const checkUserType = (setUserType) => {
    Axios.get(`https://api-service-ecpp.onrender.com/api/imie`, { withCredentials: true })
        .then((response) => {
            setUserType(response.data.accountType);
        })
        .catch((error) => {
            console.error(error);
        });
};

export default checkUserType;