import { createRef, FocusEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorMessage from '../components/errorMessage';

function Signin() {

    const server_domain   = import.meta.env.VITE_REACT_SERVER_DOMAIN;
    
    const username_label_ref = createRef<HTMLLabelElement>();
    const email_label_ref = createRef<HTMLLabelElement>();
    const password_label_ref = createRef<HTMLLabelElement>();
    const email_field_tmp_ref = createRef<HTMLDivElement>();
    const password_field_tmp_ref = createRef<HTMLDivElement>();
    const username_field_tmp_ref = createRef<HTMLDivElement>();

    const [userValues, setUserValues] = useState<Record<string, string>>({
        username: "",
        email: "",
        password: ""
    });

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isError, setIsError]           = useState<boolean>(false);
    const [passwordInfo, setPasswordInfo] = useState<boolean>(false);
    const navigate = useNavigate()


    const catchUserInfo = (e: FormEvent<HTMLInputElement>) => {
        const index = e.currentTarget.name;
        const value = e.currentTarget.value;

        setUserValues(prev => ({
            ...prev,
            [index]: value
        }));
    }

    const saveUserInfo = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let errorMessage = "";

        if (userValues.username == "" || userValues.email == "" || userValues.password == "") {
            errorMessage = "Fields should not be empty!";
        } else if (!isValidEmail(userValues.email)) {
            errorMessage = "Email is not valid";
        } else if (userValues.password.length < 8) {
            errorMessage = "Password should equal or higher than 8 letters";
        }

        if (errorMessage.length > 0) {
            setIsError(true);
            setErrorMessage(errorMessage);
        } else {
            postUserData(userValues);
        }

    }

    async function postUserData(datas: Object,) {
        try {
            const res = await axios.post(server_domain + "/signin", {user: datas});
            
            if (res.data == "Success") {
                navigate('/Login');
            }else if (res.data == "Email registered"){
                setIsError(true);
                setErrorMessage("Email already saved...");
            } else {
                console.log('There is an error in register');
            }

        } catch (error) {
            console.log("Post data error")
        }
    }

    function isValidEmail(email: string) {
        return /\S+@\S+\.\S+/.test(email);
    }

    const increaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
        const input_focused_class = e.currentTarget.classList.value;

        if (input_focused_class.includes("email")) {
            email_label_ref.current?.classList.add('active');
            email_field_tmp_ref.current?.classList.add('active');
        } else if (input_focused_class.includes("password")) {
            password_label_ref.current?.classList.add('active');
            password_field_tmp_ref.current?.classList.add('active');
            setPasswordInfo(true);
        } else {
            username_label_ref.current?.classList.add('active');
            username_field_tmp_ref.current?.classList.add('active');
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
            setPasswordInfo(false);
        } else {
            if (value == "") {
                username_label_ref.current?.classList.remove('active');
            }
            username_field_tmp_ref.current?.classList.remove('active');
        }
    }

    return (
        <div className="signin-container flex justify-center items-center">
            <div className="content flex justify-center items-center md:flex-wrap">
                <div className="right">
                    <div className="title-container">
                        <h2 className="signin-title">Sign in</h2>
                    </div>
                    <div className="fields-container mt-5">
                        <ErrorMessage message={errorMessage} isError={isError}/>
                        <form>
                            <div className="fields">
                                <label ref={username_label_ref} htmlFor="username" className="label-animated">Username</label>
                                <div className="input">
                                    <input type="text" name="username" onChange={catchUserInfo} className="username" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} />
                                </div>
                                <div ref={username_field_tmp_ref} className="fields-tmp"></div>
                            </div>
                            <div className="fields">
                                <label ref={email_label_ref} htmlFor="email" className="label-animated">Email</label>
                                <div className="input">
                                    <input type="email" name="email" onChange={catchUserInfo}  className="email" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} />
                                </div>
                                <div ref={email_field_tmp_ref} className="fields-tmp"></div>
                            </div>
                            <div className="fields">
                                <label ref={password_label_ref} htmlFor="password" className="label-animated">Password</label>
                                <div className="input">
                                    <input type="password" name="password" onChange={(e) => catchUserInfo(e)} className="password" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} />

                                    <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert" style={passwordInfo ? { display: 'block' } : { display: 'none' }}>
                                        <span className="font-medium">Info:</span> Password should equal or higher than 8 letters
                                    </div>
                                </div>
                                <div ref={password_field_tmp_ref} className="fields-tmp"></div>
                            </div>
                            <div className="button-signin">
                                <button onClick={saveUserInfo}>Sign in</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="left">
                    <div className="image">
                        <img src="./src/assets/images/siginin-todo-list.jpg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signin