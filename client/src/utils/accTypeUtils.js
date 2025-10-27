import Axios from "axios";

const hasSpecialAccess = (name, surname, feature) => {
    const fullName = `${name} ${surname}`;
    switch(feature) {
        case 'urlopy':
            return ['Jarosław Pajor', 'Paweł Wójtowicz'].includes(fullName);
        case 'projekty':
            return ['Jarosław Pajor', 'Paweł Wójtowicz'].includes(fullName);
        case 'raporty':
            return ['Jarosław Pajor', 'Małgorzata Tylicki'].includes(fullName);
        case 'tydzien':
            return ['Jarosław Pajor', 'Paweł Wójtowicz', 'Małgorzata Tylicki'].includes(fullName);
        default:
            return false;
    }
};

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

export { checkUserType as default, hasSpecialAccess };