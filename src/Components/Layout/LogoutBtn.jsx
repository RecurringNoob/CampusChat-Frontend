
import { useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
import  {logout as logoutAPI}  from '../../api/auth.js';
function LogoutBtn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const handleLogout = async () => {
  await logoutAPI(); // clears cookie on backend
  dispatch(logout); // clears redux
  navigate('/'); // UI decides redirect
};
  
  return (
    <button
      className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
      onClick={handleLogout}
    >
      Logout
    </button>
  )
}

export default LogoutBtn