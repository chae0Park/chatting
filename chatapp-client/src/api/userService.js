import axios from 'axios'; //sign up
import api from './axiosInstance.js'


//start authoriseService
export const signup = async (fd) => {
    return await axios.post('http://localhost:5001/api/signup', fd, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const login = async(fd) => {
    try{
        const response =  await api.post('/login', fd);

        const { accessToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);

        return { user, accessToken };

    }catch(error){
        throw new Error(error.response?.data?.message || 'An error occurred');
    }
};

export const edit = async (formData) => {
    try{
        const response = await api.put('/user/edit', formData);
        return response.data;
    }catch(error){
        console.error("Error during user edit:", error.response?.data || error.message);
        throw new Error(
            typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.message || 'Failed to edit user information'
        );
    }
}
//end authoriseService


//start userService
  export const fetchUserData = async () => {
    try{ 
        const response = await api.get('/user');
        return response.data;
    }catch(error){
        throw new Error('Failed to fetch user data');
    }
  };

  export const searchUsers = async (query) => {
        try {
            const response = await api.get(`/find-users?query=${query}`);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Something went wrong');
        }
    };

    export const fetchClickedUserData = async (id) => {
        // console.log('fetchClickedUserData 의 param id', id);
        try{
            const response = await api.get(`/fetch-one-user/${id}`);
            return response.data;
        }catch(error){
            throw new Error(error.response?.data?.message || 'failed to fetch the user');
        }
    }

    //그룹챗 - handleAddMoreUser()가 호출되면 호출할 서비스를 만든다
    export const fetchmultiUserData = async (ids) => {
        try{
            const response = await api.get('/fetch-multiple-users', {
                params: {
                    ids: ids.join(','),
                },
            });
            return response.data;
        }catch(error){
            throw new Error(error.response?.data?.message || 'failed to fetch the user');
        }
    }


    export const addFriends = async (friendId) => {
        try {
            const response = await api.put('/add-friend', { friendId });
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Something went wrong');
        }
    }


export const fetchFriends = async (friendId) => {
    try {
        const response = await api.get(`/fetch-friends?friendId=${friendId}`);
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Something went wrong');
    }
}