import './Setting.css';
import { useMutation } from '@tanstack/react-query'; //, 
import { edit } from '../../api/userService'; //
import { useState, useRef } from 'react';
import { useFetchLoginUser } from '../../hooks/util';
import { queryClient } from '../../hooks/util';


const Setting = () => {
    const [previewImage, setPreviewImage] = useState('');
    const fileInputRef = useRef();
    const accessToken = localStorage.getItem('accessToken');
    const { data: user } = useFetchLoginUser({accessToken});
    const mutation = useMutation({
        mutationFn: edit,
        onSuccess: () => {
            queryClient.invalidateQueries(['user']);
            alert('User info updated successfully!');
        },
        onError: (error) => {
            console.error('Mutation error:', error);
            alert(error.message);
            setPreviewImage('');
        },
    });

    const handleProfileClick = () => {
        fileInputRef.current.click();
    }

    const handleEdit = async (e) => {
        e.preventDefault();

        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());

        //first trial failed: used '||' to all 
        if (!data.name && !data.currentPassword && !data.newPassword && !data.newPasswordConfirm && !data.profileImage) {
            alert('Please check your data');
            return;
        }

        if (!data.currentPassword && (data.newPassword || data.newPasswordConfirm)) {
            alert('Please fill in password and new passwords');
            return;
        }

        if (data.newPassword) {
            if (data.newPassword !== data.newPasswordConfirm) {
                alert('Check your confirmed password!');
                return;
            };
        }
        mutation.mutate(fd); // Call the API to edit user info
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPreviewImage(null);
        } else if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            }
            reader.readAsDataURL(file);

        }

    }




    return (
        <div className="setting-container">
            <h1 className='edit-profile'>Edit profile</h1>
            <div className='user-profile-card'>

                {user?.profileImage && (
                    <div className='profile-image-container' onClick={handleProfileClick}>
                        <img
                            src={previewImage ? previewImage : `http://localhost:5001${user?.profileImage}`}
                            alt="profile"
                            className='profile-img-rsc'
                        />
                    </div>
                )}
                {user && (
                    <div className="user-info">
                        <p>{user?.name}</p>
                        <p>{user?.email}</p>
                    </div>
                )}


            </div>



            <form onSubmit={handleEdit} className='setting-form'>
                <div>
                    <label className='form-label'>Name:</label>
                    <input
                        type="text"
                        name='name'
                        className='setting-input'
                    />
                </div>
                <div>
                    {/* 현재 비밀번호를 입력, 일치하면 새로운 비밀번호 설정가능  */}
                    <label className='form-label'>Password:</label>
                    <input
                        type="password"
                        name='currentPassword'
                        className='setting-input'
                    />
                </div>
                <div>
                    {/* 새 비밀번호 입력  */}
                    <label className='form-label'>new password:</label>
                    <input
                        type="password"
                        name='newPassword'
                        className='setting-input'
                    />
                </div>
                <div>
                    {/*  새 비밀번호 확인 */}
                    <label className='form-label'>new password confirm:</label>
                    <input
                        type="password"
                        name='newPasswordConfirm'
                        className='setting-input'
                    />
                </div>
                <div>
                    {/* <label className='form-label'>Profile Image:</label> */}
                    <input
                        type='file'
                        name='profileImage'
                        accept='image/*'
                        ref={fileInputRef}
                        style={{display: 'none'}}
                        onChange={handleImageChange}
                        className='setting-input'
                    />
                </div>




                <button className='setting-submit-btn' type="submit">save</button>
            </form>


        </div>
    )
}

export default Setting;

