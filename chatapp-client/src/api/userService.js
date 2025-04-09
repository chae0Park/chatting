import axios from 'axios';
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
        const response =  await api.post('http://localhost:5001/api/login', fd);

        const { accessToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);

        return { user, accessToken };

    }catch(error){
        throw new Error(error.response?.data?.message || 'An error occurred');
    }
};

//todo: refreshToken 뜯어고치기
export const refreshAccessToken = async (refreshToken) => {
    try{
        const response = await axios.post('http://localhost:5001/api/refresh-token', {refreshToken});
        return response.data.accessToken;
    }catch(error){
        throw new Error('Failed to refresh access token');
    }
};

export const edit = async (formData) => {
    console.log('edit api called')
    try{
        console.log('formdata', formData);
        const response = await api.put('http://localhost:5001/api/user/edit', formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }catch(error){
        console.error("Error during user edit:", error.response || error.message);
        throw new Error('Failed to edit user information')
    }
}

//end authoriseService


//start userService
  export const fetchUserData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    try{ 
        const response = await api.get('http://localhost:5001/api/user', {
            headers: {
                Authorization : `Bearer ${accessToken}`,
            },
        });
        return response.data;
    }catch(error){
        throw new Error('Failed to fetch user data');
    }
  };


  export const searchUsers = async (query) => {
        try {
            const response = await api.get(`http://localhost:5001/api/find-users?query=${query}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            console.log('searchUsers데이터: ',response.data);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Something went wrong');
        }
    };

    export const fetchClickedUserData = async (id) => {
        // console.log('fetchClickedUserData 의 param id', id);
        try{
            const response = await api.get(`http://localhost:5001/api/fetch-one-user/${id}`, {
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            // console.log('fetchClickedUserData를 호출했을 때 가지고 오는 데이터', response.data); //{foundUser: {…}, room: {…}}
            return response.data;
        }catch(error){
            throw new Error(error.response?.data?.message || 'failed to fetch the user');
        }
    }

    //그룹챗 - handleAddMoreUser()가 호출되면 호출할 서비스를 만든다
    export const fetchmultiUserData = async (ids) => {
        try{
            const response = await api.get('http://localhost:5001/api/fetch-multiple-users', {
                params: {
                    ids: ids.join(','),
                },
                headers: {
                    Authorization : `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            return response.data;
        }catch(error){
            throw new Error(error.response?.data?.message || 'failed to fetch the user');
        }
    }


export const addFriends = async (friendId) => {
    console.log('서비스에 있는 addFriends api called')
    console.log('friendId', friendId);
    try {
        const response = await api.put('http://localhost:5001/api/add-friend', { friendId }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Something went wrong');
    }
}


export const fetchFriends = async (friendId) => {
    try {
        const response = await api.get(`http://localhost:5001/api/fetch-friends?friendId=${friendId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Something went wrong');
    }
}