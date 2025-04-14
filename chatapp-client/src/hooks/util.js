import { useQuery, useMutation } from '@tanstack/react-query'; //, useQueryClient
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { fetchUserData } from '../api/userService';


export const queryClient = new QueryClient();

//fetch user info 
export const useFetchLoginUser = ({accessToken}) => {
    const { data, isLoading, isError } = useQuery({
        queryFn : fetchUserData,
        queryKey : ['loginUser'],
        enabled: !!accessToken && (accessToken !== '' || accessToken !== null),
        refetchOnWindowFocus: false, // Disable auto-refetch on window focus
    });

    return{ data, isLoading, isError };
}; 


export const useUpdate = (updateFn, queryKey, locationToSend) => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
 
    const mutation =  useMutation({
        mutationFn : updateFn, 
        onMutate: () => { 
            console.log('Mutation is being triggered');
            setError(''); 
        },
        onError: (err) => {
            console.log('Mutation failed:', err); 
            setError(err.message || 'An error occurred');
        },
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            console.log('Stored accessToken:', localStorage.getItem('accessToken')); // Debug log
            queryClient.invalidateQueries([queryKey]);
            navigate(locationToSend); 
            window.location.reload(); // This will refresh the page
        },
        
    });

    

    return{ error, setError, mutation }
}


export const formDate = (date) => {
    const createdAt = new Date(date);

    return createdAt.toLocaleString('en-US',{
        month: 'short', //Feb
        day: '2-digit', //18
        year: '2-digit', //25
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Seoul',
    });
}








 

