import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import { handleError, handleSuccess } from '../utils'
import './style.css'
function SignUp() {
  const [signUpInfo, setsignUpInfo] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
    shopAddress: '',
    phoneNo: ''
  })

  const navigate = useNavigate();
  const handleChange = (e) => {
    const {name, value} = e.target;
    console.log(name, value);
    const copysignupInfo = { ...signUpInfo};
    copysignupInfo[name] = value;
    setsignUpInfo(copysignupInfo);
  }

  const handleSignup = async(e) => {
    e.preventDefault();
    const {name, email, password, shopName, shopAddress, phoneNo} = signUpInfo;
    if(!name || !email || !password || !shopName || !shopAddress || !phoneNo){
        return handleError('Please fill in all fields');
    }
    try{
        const url = "http://localhost:8080/auth/signup";
        const responce = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signUpInfo)
        });
        const result = await responce.json();
        const {success, message, error} = result;
        if(success){
            handleSuccess(message);
            setTimeout(() => {
                navigate('/login')
            },1000);
        }else if(error) {
            const details = error?.details[0].message;
            handleError(details);
        }else if(!success){
            handleError(message);
        }
        console.log(result);
    }catch(err){
        handleError(err);
    }
  }
  return (
    <div className='container'>
      <h1>SignUp</h1>
      <form onSubmit={handleSignup}>
        <div>
            <label htmlFor='name'>Name</label>
            <input
                onChange={handleChange}
                type='text'
                name='name'
                autoFocus
                placeholder='Enter your name.....'
                value={signUpInfo.name}
            />
        </div>
        <div>
            <label htmlFor='email'>Email</label>
            <input
                onChange={handleChange}
                type='email'
                name='email'
                placeholder='Enter your Email.....'
                value={signUpInfo.email}
            />
        </div>
        <div>
            <label htmlFor='password'>Password</label>
            <input
                onChange={handleChange}
                type='password'
                name='password'
                placeholder='Enter your password.....'
                value={signUpInfo.password}
            />
        </div>
        <div>
            <label htmlFor='shopName'>Shop Name</label>
            <input
                onChange={handleChange}
                type='text'
                name='shopName'
                placeholder='Enter your shop name.....'
                value={signUpInfo.shopName}
            />
        </div>
        <div>
            <label htmlFor='shopAddress'>Shop Address</label>
            <input
                onChange={handleChange}
                type='text'
                name='shopAddress'
                placeholder='Enter your shop address.....'
                value={signUpInfo.shopAddress}
            />
        </div>
        <div>
            <label htmlFor='phoneNo'>Phone Number</label>
            <input
                onChange={handleChange}
                type='text'
                name='phoneNo'
                placeholder='Enter your phone number.....'
                value={signUpInfo.phoneNo}
            />
        </div>
        <button type='submit'>SignUp</button>
        <span>
            Already have an account?
            <Link to='/login'>Login</Link>
        </span>
      </form>
      <ToastContainer/>
    </div>
  )
}

export default SignUp
