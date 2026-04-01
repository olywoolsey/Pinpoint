import axios from 'axios';

const instance = axios.create({
    baseURL: "http://localhost:3000",
});

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401 && error.config.url !== '/check_user_sub_status') {
            // Handle the error here. For example, you can redirect the user to the login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;