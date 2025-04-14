import './Home.css';
import homeImage from '../../assets/home-main-image.jpg'
import { Link } from 'react-router-dom';
import { useFetchLoginUser } from '../../hooks/util';
import { useEffect } from 'react'; // , useState
import socket from '../../server.js';



const Home = () => {
    const accessToken = localStorage.getItem('accessToken');
    const { data: user } = useFetchLoginUser({accessToken});

    useEffect(() => {
        if (user) {
            console.log('user: ',user);
            const userId = user.id
            socket.emit("login", userId); 
        }
        if(accessToken){
            console.log('home컴포넌트에서 찍힌 accessToken : ', accessToken);
        }
    }, [user, accessToken]); 

    //when the button is Logout and  user clicks 'Logout' then 'localStorage.removeItem('accessToken');'
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.reload(); // This will refresh the page
    }

        return(
        <div className="home">
            <div className="nav-btn">
                <p>
                    <Link to={user ? '/':'/login'}  onClick={user ? handleLogout : undefined}>
                        {user ? 'logout': 'login'}
                    </Link>
                </p>
                <p>
                    <Link to={user && '/chat'}>
                        {user && 'chat'}
                    </Link>
                </p>
                <p>
                    <Link to={'/setting'}>
                        setting
                    </Link>
                </p>
            </div>

            <div className='home-main-img' >
                <img src={homeImage} alt='main page' className='homeImage' />
            </div>

        </div>
    )


}

export default Home;