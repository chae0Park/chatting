import './Setting.css';
import { useMutation } from '@tanstack/react-query'; //, 
import { edit } from '../../api/userService'; //
import { useState, useRef } from 'react';
import { useFetchLoginUser } from '../../hooks/util';
import { queryClient } from '../../hooks/util';


const Setting = () => {
    const [previewImage, setPreviewImage] = useState('');
    const fileInputRef = useRef();
    const { data: user } = useFetchLoginUser();
    const mutation = useMutation({
        mutationFn: edit,
        onSuccess: () => {
            queryClient.invalidateQueries(['user']);
        }

    });

    if (user) {
        console.log('user?', user);
    }

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

        try {
            mutation.mutate(fd); // Call the API to edit user info

            alert('User info updated successfully!');
        } catch (error) {
            console.error('Error updating user info', error);
            setPreviewImage('');
            alert('Failed to update user info');
        }
    };

    //onloadend method is an event handler in the FileReader API that triggers when the file reading operation is complete.
    //In this case, it sets the image preview once the file is fully loaded.
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

    /* processing order is 
    1. get file from e.targer.files[0]
    2. FileReader 
    3.  read file using '.readAsDataURL(file)'
    4.  make cb reader.onloadend
    */

    // const handleRemoveImage = () => {
    //     //클릭하면 미리보기 지우고 미리보기 지우기 상태 true로 바꿈 
    // }




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

/*
클라이언트에서 이미지 업로드 [Setting.js] →
라우터에서 upload() 메소드로 파일 저장 (destination과 filename 설정 후 새로운 파일명 생성) [userRoutes.js, upload.js] →
컨트롤러에서 profileImage DB에 저장할 때 새로 만들어진 파일명을 넣어줌 [user.controller.js]  →
db의 profileImage 값과(컨트롤러에서 저장) upload폴더에 저장된 값이(upload.js multer로 저장) 같아서 클라이언트에서 user.profileImage로 이미지를 불러옵니다.
*/


/* 
프리뷰
1. useState 로 관리 
2. 체인지 되는 파일 detecting 해서 FileReader() 사용해줌 => 이 함수를 handleImageChange 로 명명
3. input에 handleImageChange 를 사용해서 새로운 이미지가 올라오면 읽어내어 보여주도록 함 
4.조건애 따라 jsx가 생성될 수 있도록 함 
*/