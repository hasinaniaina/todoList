import axios from 'axios';
import { FocusEvent, FormEvent, ReactNode, createRef, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ref, uploadBytes } from 'firebase/storage';
import { storage, getImage } from '../../firebase';
import Breadcrumbs from '../components/breadcrumbs';
import ErrorMessage from '../components/errorMessage';
import { changeEyeShowing } from '../utils/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface Content {
    children: ReactNode
}

function Home(porps: Content) {
    const server_domain = import.meta.env.VITE_REACT_SERVER_DOMAIN;
    const navigate = useNavigate();

    const username_label_ref = createRef<HTMLLabelElement>();
    const password_label_ref = createRef<HTMLLabelElement>();
    const username_field_tmp_ref = createRef<HTMLDivElement>();
    const password_field_tmp_ref = createRef<HTMLDivElement>();

    const [userValues, setUserValues] = useState<Record<string, string>>({
        _id: "",
        username: "",
        password: "",
        photo: ""
    });

    const [hideLoading, setHideLoading] = useState<string>("");
    const [menuActive, setMenuActive] = useState<boolean>(false);
    const [show, setShow] = useState(false);
    const [imageUploaded, setImageUploaded] = useState<string>("");
    const [btnSaveLoading, setBtnSaveLoading] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [isEyeIconShow, setIsEyeIconShow] = useState<Array<boolean>>([false, true]);
    const [isSomethingAdded, setIsSomethingAdded] = useState<boolean>(false);

    const menuRef = useRef<HTMLDivElement>(null);

    axios.defaults.withCredentials = true;

    useEffect(() => {
        const rememberedUserId = sessionStorage.getItem('userId');

        axios.post(server_domain + '/getCurrentUser', { rememberedUserId: rememberedUserId })
            .then((result) => {
                if (!result.data.valid) {
                    navigate('/login');
                } else {
                    const userData = result.data.user;
                    setUserValues(userData);
                    setImageUploaded(userData.photo);
                }
            })
            .catch((error => console.log(error)));

        let handlerClickDom = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as HTMLDivElement)) {
                setMenuActive(false);
            }
        }

        document.addEventListener('mousedown', handlerClickDom);

        return () => {
            document.removeEventListener("mousedown", handlerClickDom);
        }
    }, [isSomethingAdded]);

    const showMenu = (e: FormEvent<HTMLParagraphElement>) => {
        e.preventDefault();
        setMenuActive(!menuActive);
    }

    const logout = (e: FormEvent<HTMLParagraphElement>) => {
        e.preventDefault();
        axios.get(server_domain + '/logout').then(() => {
            sessionStorage.clear();
            navigate('/login');
        })
    }

    const increaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
        const input_focused_class = e.currentTarget.classList.value;

        if (input_focused_class.includes("username")) {
            username_label_ref.current?.classList.add('active');
            username_field_tmp_ref.current?.classList.add('active');
        } else if (input_focused_class.includes("password")) {
            password_label_ref.current?.classList.add('active');
            password_field_tmp_ref.current?.classList.add('active');
        }

        setIsError(false);
    }


    const decreaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
        const input_blured_class = e.currentTarget.classList.value;
        const value = e.currentTarget.value;


        if (input_blured_class.includes("username")) {
            if (value == "") {
                username_label_ref.current?.classList.remove('active');
            }

            username_field_tmp_ref.current?.classList.remove('active');
        } else if (input_blured_class.includes("password")) {
            if (value == "") {
                password_label_ref.current?.classList.remove('active');
            }

            password_field_tmp_ref.current?.classList.remove('active');
        }
    }

    const catchUserInfo = (e: FormEvent<HTMLInputElement>) => {
        e.preventDefault();

        const index = e.currentTarget.name;
        const value = e.currentTarget.value;

        setUserValues(prev => ({
            ...prev,
            [index]: value
        }));
    }



    const handleModalClose = () => {
        setHideLoading("");
        setShow(false);
    }

    const handleModalShow = () => {
        setBtnSaveLoading("");

        setTimeout(() => {
            const username_label = document.getElementById('username-label');
            username_label?.classList.add('active');
            setHideLoading("hide");
        }, 1000);

        setShow(true);
    }



    const getImageFile = (e: FormEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files;
        if (file) {
            const profile = file[0];
            setHideLoading("");

            const imageRef = ref(storage, `todo-list-profile/${userValues._id}`);

            uploadBytes(imageRef, profile).then(() => {
                getImage(imageRef).then((imageUploaded) => {
                    setUserValues({
                        ...userValues,
                        photo: imageUploaded
                    });

                    setImageUploaded(imageUploaded);
                    setHideLoading("hide");
                });

            })
        }
    }

    const showPassword = (index: number) => {
        setIsEyeIconShow(changeEyeShowing(index));
    }

    const saveProfil = () => {
        let error = false;


        if (userValues.username == "") {
            setErrorMessage("Username should not be empty.");
            error = true;
        } else if (userValues.password.length < 8 && userValues.password != "") {
            setErrorMessage("Passowrd should be equal or higher than 8 letters");
            error = true;
        }

        if (error) {
            setIsError(true);
            return;
        }

        setBtnSaveLoading("active");

        axios.post(server_domain + "/updateUser", { userValues: userValues })
            .then((response) => {
                if (response.data.result) {
                    setTimeout(() => {
                        navigate('/project');
                        setBtnSaveLoading("");
                        setShow(false);
                        setIsError(false);
                        setErrorMessage("");
                        setIsSomethingAdded(!isSomethingAdded);
                    }, 2000);
                } else {
                    console.log(response.data.value);
                }
            }).catch((error) => console.log("Update user info error: " + error));
    }


    return (
        <>
            <div className="dashboard">
                <div className="header flex justify-between items-center sm:flex-wrap sm:justify-center">
                    <div className="left">
                        <h2>#Dashboard</h2>
                    </div>
                    <div className="right flex items-center sm:flex-wrap sm:justify-center">
                        <div className="avatar mr-1">
                            <img src={imageUploaded} alt="avatar" />
                        </div>
                        <div className="username" ref={menuRef}>
                            <p onClick={showMenu}>{userValues?.email} <span><FontAwesomeIcon icon={faCaretDown} /></span></p>
                            <ul className={menuActive ? "active" : "not-active"}>
                                <li><p onClick={handleModalShow}>Profil</p></li>
                                <li><p onClick={logout}>LogOut</p></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="breadcrumbs">
                        <Breadcrumbs />
                    </div>
                    <div className="dashboard-content">
                        {porps.children}
                    </div>
                </div>
            </div>
            <Modal show={show} onHide={handleModalClose} animation={false}  backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="profil-form">
                        <form>
                            <div className="fields-img">
                                <div className="img">
                                    <img src={imageUploaded} alt="user-avatar" />
                                </div>
                                <FontAwesomeIcon icon={faPen} />
                                <input type="file" className='input-file' onChange={getImageFile} />
                            </div>
                            <ErrorMessage message={errorMessage} isError={isError} />
                            <div className={"fields "}>
                                <label ref={username_label_ref} htmlFor="username" className="label-animated" id="username-label">Username</label>
                                <div className="input">
                                    <input type="text" name="username" onChange={catchUserInfo} value={userValues.username} id="username" className="username" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} />
                                </div>
                                <div ref={username_field_tmp_ref} className="fields-tmp"></div>
                            </div>
                            <div className={"fields "}>
                                <label ref={password_label_ref} htmlFor="password" className="label-animated">Change password</label>
                                <div className="input">
                                    <input type="password" name="password" onChange={catchUserInfo} id="password" className="password" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} />
                                    <div className="show-password-icon">
                                        <FontAwesomeIcon icon={faEye} className={(isEyeIconShow[0]) ? "active" : ""} onClick={() => showPassword(0)} />
                                        <FontAwesomeIcon icon={faEyeSlash} className={(isEyeIconShow[1]) ? "active" : ""} onClick={() => showPassword(1)} />
                                    </div>
                                </div>

                                <div ref={password_field_tmp_ref} className="fields-tmp"></div>
                            </div>
                        </form>
                        <div className={"loading " + hideLoading} >
                            <img src="../src/assets/images/Walk.gif" alt="" />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" id="modal-btn-save" onClick={saveProfil}>
                        Save changes
                        <div className={"save-loading " + btnSaveLoading}></div>
                    </Button>
                    <Button variant="secondary" onClick={handleModalClose}>
                        close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Home;