import Axios from "axios";

const checkUserType = (setUserType) => {
    Axios.get("http://47.76.209.242:5000/api/imie", { withCredentials: true })
        .then((response) => {
            setUserType(response.data.accountType);
        })
        .catch((error) => {
            console.error(error);
        });
};

export default checkUserType;