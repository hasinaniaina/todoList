import axios from "axios";
import { FocusEvent, FormEvent, createRef, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import ErrorMessage from "../components/errorMessage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const server_domain = import.meta.env.VITE_REACT_SERVER_DOMAIN;

  const initializeIsEyeShow =  [false, true]

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const email_label_ref = createRef<HTMLLabelElement>();
  const password_label_ref = createRef<HTMLLabelElement>();
  const email_field_tmp_ref = createRef<HTMLDivElement>();
  const password_field_tmp_ref = createRef<HTMLDivElement>();

  const [userValues, setUserValues] = useState<Record<string, string>>({
    email: "",
    password: ""
  });



  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isEyeIconShow, setIsEyeIconShow] = useState<Array<boolean>>(initializeIsEyeShow);
  const [btnSaveLoading, setBtnSaveLoading] = useState<string>("");



  useEffect(() => {
    const rememberedUserId = sessionStorage.getItem('userId');

    axios.post(server_domain + '/getCurrentUser', { rememberedUserId: rememberedUserId })
      .then((result) => {
        if (result.data.valid) {
          navigate('/project');
        } else {
          navigate('/login');
        }
      })
      .catch((error => alert(error)))
  }, []);

  const catchUserInfo = (e: FormEvent<HTMLInputElement>) => {
    const index = e.currentTarget.name;
    const value = e.currentTarget.value;

    setUserValues(prev => ({
      ...prev,
      [index]: value
    }));
  }

  const login = (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const userDatas = axios.post(server_domain + "/login", { user: userValues, remember: rememberMe });
    setBtnSaveLoading("active");
    userDatas.then((result) => {
      const userId = result.data.user._id;
      const rememberMe = result.data.rememberMe;

      setTimeout(() => {
        if (userId) {
          if (rememberMe) {
            sessionStorage.setItem('userId', userId);
          }
  
          navigate('/project');
        } else {
          setIsError(true);
          setErrorMessage("Credential not valid...");
        }
  
        setBtnSaveLoading("");

      },1000);
    });
  }

  const checkRememberMe = () => {
    setRememberMe(!rememberMe);
  }


  const increaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
    const input_focused_class = e.currentTarget.classList.value;

    if (input_focused_class.includes("email")) {
      email_label_ref.current?.classList.add('active');
      email_field_tmp_ref.current?.classList.add('active');
    } else if (input_focused_class.includes("password")) {
      password_label_ref.current?.classList.add('active');
      password_field_tmp_ref.current?.classList.add('active');
    }

    setIsError(false);

  }


  const decreaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
    const input_blured_class = e.currentTarget.classList.value;
    const value = e.currentTarget.value;


    if (input_blured_class.includes("email")) {
      if (value == "") {
        email_label_ref.current?.classList.remove('active');
      }

      email_field_tmp_ref.current?.classList.remove('active');
    } else if (input_blured_class.includes("password")) {
      if (value == "") {
        password_label_ref.current?.classList.remove('active');
      }

      password_field_tmp_ref.current?.classList.remove('active');
    }
  }


  const changeEyeShowing = (index: number) => {
    let tmp = [];

    const passowrd_field = document.getElementById('password');
    if (index == 0) {
        tmp[0] = false;
        tmp[1] = true;
        passowrd_field?.setAttribute('type', 'password');
    } else {
        tmp[0] = true;
        tmp[1] = false;
        passowrd_field?.setAttribute('type', '');
    }

    setIsEyeIconShow(tmp);

}


  return (
    <div className="login-container flex justify-center items-center">
      <div className="content flex justify-center items-center md:flex-wrap-reverse">
        <div className="left">
          <div className="image">
            <img src="./src/assets/images/login-todo-list.jpg" alt="" />
          </div>
        </div>
        <div className="right">
          <div className="title-container">
            <h2 className="Login-title">Login</h2>
          </div>
          <div className="fields-container mt-5">
            <ErrorMessage message={errorMessage} isError={isError} />
            <form action="">
              <div className="fields">
                <label ref={email_label_ref} htmlFor="email" className="label-animated">Email</label>
                <div className="input">
                  <input type="email" name="email" id="email" onChange={catchUserInfo} className="email" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} />
                </div>
                <div ref={email_field_tmp_ref} className="fields-tmp"></div>
              </div>
              <div className="fields">
                <label ref={password_label_ref} htmlFor="password" className="label-animated">Password</label>
                <div className="input">
                  <input type="password" name="password" id="password" onChange={catchUserInfo} className="password" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} />
                  <div className="show-password-icon">
                    <FontAwesomeIcon icon={faEye} className={(isEyeIconShow[0]) ? "active" : ""} onClick={() => changeEyeShowing(0)} />
                    <FontAwesomeIcon icon={faEyeSlash} className={(isEyeIconShow[1]) ? "active" : ""} onClick={() => changeEyeShowing(1)} />
                  </div>
                </div>

                <div ref={password_field_tmp_ref} className="fields-tmp"></div>
              </div>
              <div className="remember-me">
                <input type="checkbox" name="remember" id="remember-me" onClick={checkRememberMe} />
                <span>Remember me</span>
              </div>
              <div className="button-login">
                <button onClick={login}>
                  Login
                  <div className={"save-loading " + btnSaveLoading}></div>
                </button>
              </div>
              <div className="dont-have-account mt-5">
                <Link to="/Signin" className="text-slate-400	">Don't have an account? Sign In.</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login