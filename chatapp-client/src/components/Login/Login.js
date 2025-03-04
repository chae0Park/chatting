import './Login.css';
import loginImage from '../../assets/ferrisWheel.jpg'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../../api/userService'; 
import { useUpdate } from '../../hooks/util';


const Login = () => {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const { error, setError, mutation } = useUpdate(login, 'user', '/');


    function handleSubmit(e){
        e.preventDefault();

        // 이메일 패스워드 값이 있는지 체크 
        if(!email || !currentPassword){
            setError('please fill in both the email and password.');
            return;
        }

        setError('');

        //저장 
        mutation.mutate({ email, currentPassword });

       
    }


    return(
        <div className='login'>
            <div className='login-container'>
                <form className='login-form' onSubmit={handleSubmit}>
                    <h1>welcome</h1>
                    <h2>please enter your details</h2>
                    <div className='login-inputs'>
                        <input type='email' placeholder='email' onChange={(e) => {setEmail(e.target.value)}} value={email}/>
                        <input type='password' placeholder='password' onChange={(e) => {setCurrentPassword(e.target.value)}} value={currentPassword}/>
                    </div>
                    {error && <p style={{ fontSize : '10px' }}>{error}</p>}                 
                    <button className='login-btn'>{mutation.isLoading ? 'Logging in' : 'Log in' }</button>
                </form>
                <p>Don't have an account? <Link to='/signup'><span className='login-signup-link'>sign up</span></Link></p>
            </div>
            <div className='login-image'>
                <img className='login-smiling-girl' src={loginImage} alt='a smiling girl' />
            </div>
        </div>
    )
}
export default Login;