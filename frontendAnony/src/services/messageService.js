import { useParams } from 'react-router-dom';
import api from './api';
import auth from './auth';



const messageService = {

    getMessages: async (username) => {
        return api.get(`/messages?username=${username}`);
    },

    sendIndiviualMessage: async (username, message, files = []) => {

        const formData = new FormData();

        formData.append('username', username);
        formData.append('content', message);
        files.forEach((file) => formData.append('media[]', file));

        return api.post(`/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
}

export default messageService;