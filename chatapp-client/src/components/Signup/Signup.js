import './Signup.css';
import signupImage from '../../assets/holdingUpFlower.jpg';
import { useState, useRef } from 'react';
import { useUpdate } from '../../hooks/util';
import { signup } from '../../api/userService';


//필드 유효성 검사 뜨는 ui 수정하기 

const Signup = () => {
    const [validationErrors, setValidationErrors] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef();

    const { mutation } = useUpdate(signup, 'user', '/login');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file){
            setProfileImage(URL.createObjectURL(file)); //show selected image as a preview
        }
    };
    
    function handleSubmit(e) {
        e.preventDefault();

        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        /*
        fd.entries():
        [['username', 'john_doe'], ['password', 'secret123']]

        Object.fromEntries(): === data
        {
            username: "john_doe",
            password: "secret123"
        }
        */

        setValidationErrors([]);

        const fields = {
            email: 'Email is required',
            currentPassword: 'Password is required',
            name: 'Name is required',
            phone: 'Phone number is required',
            profileImage: 'Profile image is required',
        };

        
        const errors = Object.keys(fields).reduce((acc, field) => {
            if (!data[field]) {
                acc.push(fields[field]);
            }
            return acc;
        }, []);


        if(errors.length > 0 ){
            setValidationErrors(errors);
            return;
        }

        mutation.mutate(fd);

    }

    const handleProfileClick = () => {
        fileInputRef.current.click();
    }

    


    return(
        <div className='signup'>
            <div className='signup-container'>
                <form className='signup-form' onSubmit={handleSubmit}>
                    <h1>welcome</h1>
                    <h3>please enter your details</h3>
                    <div className='signup-inputs'>
                        <input  type='email' placeholder='email' name='email'/>
                        <input  type='password'placeholder='password' name='currentPassword'/>
                        <input  type='text'placeholder='name' name='name'/>
                        <input  type='phone'placeholder='phone' name='phone'/>
                        <input 
                            type='file'
                            name='profileImage'
                            accept='image/*' 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }} //hide input element
                        />
                    </div> 
                    {validationErrors.length > 0 && (
                        <div className='error-message'>
                            {validationErrors.map((err, idx) => (
                                <p key={idx} className='error'>{err}</p>
                            ))}
                        </div>
                    )}                
                    <button className='signup-btn'>Sign up</button>
                </form>
            </div>

            <div className='signup-image-container'>
                <div className='signup-image'>
                    <img 
                        src={profileImage || signupImage} //profileImage : preview
                        alt='a girl holding up flower' 
                        className='signup-image-res' 
                    />                 
                </div>
                <div className='profile-upload-guide' onClick={handleProfileClick}>
                    Click here to upload your profile image.
                </div>
            </div>

        </div>
    )
}
export default Signup;