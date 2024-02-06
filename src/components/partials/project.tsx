
import { FocusEvent, createRef, useEffect, useState, MouseEvent, FormEvent } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Home from "../../pages/home";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faFolderBlank } from '@fortawesome/free-regular-svg-icons';
import ErrorMessage from '../errorMessage';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string,
    username: string,
    password: string,
    photo: string,
}

export default function Project() {
    const server_domain = import.meta.env.VITE_REACT_SERVER_DOMAIN;
    const navigate = useNavigate();

    const [show, setShow] = useState<boolean>(false);
    const project_name_label_ref = createRef<HTMLLabelElement>();
    const project_participant_label_ref = createRef<HTMLLabelElement>();

    const project_name__field_tmp_ref = createRef<HTMLDivElement>();
    const poject_participant_field_tmp_ref = createRef<HTMLDivElement>();

    const [userValues, setUserValues] = useState<Record<string, string>>({
        _id: "",
        username: "",
        password: "",
        photo: ""
    });

    const [imageUrl, setImageUrl] = useState<string>("");
    const [listSearch, setListSearch] = useState<Array<object>>([
        {
            _id: "",
            userImageUrl: "",
            username: "",
        }
    ]);

    const [showListUserSearch, setShowListUserSearch] = useState<String>("");
    const [hideLoading, setHideLoading] = useState<string>("");
    const [projectParticipant, setProjectParticipant] = useState<Array<Record<string, string>>>([]);
    const [isAddParticipantSuccess, setIsAddParticipantSuccess] = useState<Array<Record<string, boolean>>>([]);
    const [projectName, setProjectName] = useState<string>("");
    const [btnSaveDisabled, setBtnSaveDisable] = useState<boolean>(false);
    const [btnSaveLoading, setBtnSaveLoading] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [projectList, setProjectList] = useState<Array<Record<string, string>>>([]);
    const [isEditProject, setIsEditProject] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string>("");
    const [isSomethingAdded, setIsSomethingAdded] = useState<boolean>(false);
    const [isDeleteConfirmationShow, setIsDeleteConfirmationShow] = useState<Array<boolean>>([]);
    const [projectHasTask, setProjectHasTask] = useState<Array<boolean>>([]);
    const [isProjectOwner, setisProjectOwner] = useState<Array<boolean>>([]);
    const [numberOfCurrentUserTaskInProject, setNumberOfCurrentUserTaskInProject] = useState<Record<string, number>>({});
   





    useEffect(() => {
        const rememberedUserId = sessionStorage.getItem('userId');

        setHideLoading("");
        axios.post(server_domain + '/getCurrentUser', { rememberedUserId: rememberedUserId })
            .then((user) => {
                const current_user = user.data.user;
                setUserValues(current_user);

                axios.get(server_domain + '/getProject')
                    .then((project) => {
                        const projects = project.data.result;
                        const project_number_for_delete_confirmation = [];
                         
                        if (projects.length > 0) {
                            axios.get(server_domain + "/getTasks")
                                .then(result => {
                                    if (result.data.valid) {
                                        const tasks = result.data.result;
                                        const hasTask = [];
                                        const current_user_project = [];
                                        const current_user_id = current_user._id;
                                        const task_member: Array<string> = [];
                                        let is_project_owner = [];
                                        let task_number_of_current_user_for_project: Record<string, number> = {};

                                        for (let i = 0; i < projects.length; i++) {
                                            let count_task_according_to_projet = 1;

                                            hasTask.push(false);
                                            is_project_owner.push(false);
                                            
                                            if (projects[i].owner['_id'] == current_user_id) {
                                                current_user_project.push(projects[i]);
                                                is_project_owner[i] = true;
                                            }

                                            for (let j = 0; j < tasks.length; j++) {
                                                if (projects[i]["_id"] == tasks[j]['project']) {
                                                    hasTask[i] = true;
                                                }

                                                // Get all project that current_user logged has a task
                                                if (
                                                    tasks[j].member.includes(current_user_id) &&
                                                    tasks[j].project.includes(projects[i]._id) &&
                                                    !task_member.includes(tasks[j].member) 
                                                ) {
                                                    if (!current_user_project.includes(projects[i])) {
                                                        current_user_project.push(projects[i]);
                                                        task_member.push(tasks[j]);
                                                    }
                                                }

                                                // Get number of current_user task on a project
                                                if (tasks[j].member.includes(current_user_id) && tasks[j].project == projects[i]._id) {
                                                    task_number_of_current_user_for_project[tasks[j].project] = count_task_according_to_projet;
                                                    count_task_according_to_projet ++;
                                                }
                                            }
                                        }                                        
                                        setProjectList(current_user_project);
                                        setIsEditProject(false);
                                        setProjectHasTask(hasTask);
                                        setisProjectOwner(is_project_owner);
                                        setNumberOfCurrentUserTaskInProject(task_number_of_current_user_for_project);
                                        
                                    }
                                }).catch(error => console.log("Get all Tasks error: " + error));

                            for (let i = 0; i < projects.length; i++) {
                                project_number_for_delete_confirmation.push(false);
                            }

                            setIsDeleteConfirmationShow(project_number_for_delete_confirmation);
                        } else {
                            setProjectList([]);
                        }

                        setTimeout(() => {
                            setHideLoading("hide");
                        }, 2000)
                    }).catch(error => console.log(error));
            }).catch(error => alert("Project participant creation error" + error));
    }, [isSomethingAdded]);


    const handleModalClose = () => {
        setShow(false);
        setIsAddParticipantSuccess([]);
        setProjectParticipant([]);
        setProjectName("");
        setErrorMessage("");
        setIsError(false);
        setBtnSaveLoading("");
        navigate('/project');
    }

    const handleModalShow = () => {
        setShow(true);
        setShowListUserSearch("");
        setBtnSaveDisable(false);
        setBtnSaveLoading("");
        setImageUrl(userValues.photo);
        hideListParticipantMouseDown();
        
    }

    const hideListParticipantMouseDown = () => {
        document.addEventListener('mousedown', (e) => {
            const list_participant_container = document.getElementById("list_participant_container");
            if (!list_participant_container?.contains(e.target as HTMLDivElement) ) {
                setShowListUserSearch("");
            }
        });
    }

    const editProject = (project_id: string, project_name: string) => {
        axios.post(server_domain + "/getUserProject", { project_id: project_id })
            .then((participant) => {
                const projectParticipant: Array<Record<string, string>> = [];
                const result = participant.data.value;

                result.map((value: { user: {} }) => {
                    projectParticipant.push(value.user);
                });

                setProjectParticipant(projectParticipant);
                setIsEditProject(true);
                setProjectId(project_id);
                handleModalShow();


                setTimeout(() => {
                    const project_label = document.getElementById('name-label');
                    project_label?.classList.add('active');
                    setProjectName(project_name);
                }, 500);

            }).catch((error) => console.log("Get participant error: " + error))
    }

    const increaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
        const input_focused_class = e.currentTarget.classList.value;
        if (input_focused_class.includes("name")) {
            project_name_label_ref.current?.classList.add('active');
            project_name__field_tmp_ref.current?.classList.add('active');
        } else if (input_focused_class.includes("participant")) {
            project_participant_label_ref.current?.classList.add('active');
            poject_participant_field_tmp_ref.current?.classList.add('active');

            const username = e.target.value;
            searchUserParticipantFromDatabase(username);
        }
    }


    const decreaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
        const input_blured_class = e.currentTarget.classList.value;
        const value = e.currentTarget.value;


        if (input_blured_class.includes("name")) {
            if (value == "") {
                project_name_label_ref.current?.classList.remove('active');
            }

            project_name__field_tmp_ref.current?.classList.remove('active');
        } else if (input_blured_class.includes("participant")) {
            if (value == "") {
                project_participant_label_ref.current?.classList.remove('active');
            }

            poject_participant_field_tmp_ref.current?.classList.remove('active');
        }
    }

    const searchParticipant = (e: FocusEvent<HTMLInputElement>) => {
        e.preventDefault();
        const username = e.currentTarget.value;

        searchUserParticipantFromDatabase(username);
    }

    const searchUserParticipantFromDatabase = (username: string) => {
        let addedParticipant: Array<Record<string, boolean>> = [];

        setShowListUserSearch("active");
        setHideLoading("");


        setTimeout(() => {
            axios.post(server_domain + "/seachUser", { username: username })
                .then(response => {
                    if (response.data.valid) {
                        const searchResult = response.data.searcResult;
                        const listSearchTmp: Array<object> = [];

                        searchResult.map((result: User, index: number) => {
                            let isAdded = false;

                            const listTmp = {
                                _id: result._id,
                                userImageUrl: result.photo,
                                username: result.username
                            }


                            projectParticipant?.map((participantAdded) => {
                                if (participantAdded._id == result._id) {
                                    isAdded = true;
                                }
                            });



                            addedParticipant.push({
                                [result._id]: isAdded
                            });


                            listSearchTmp[index] = listTmp;
                            if (listSearchTmp.length == searchResult.length) {
                                setListSearch(listSearchTmp);
                                setHideLoading('hide');
                            }

                        });

                        setIsAddParticipantSuccess(addedParticipant);


                    } else {
                        console.log("Username not found");
                        setShowListUserSearch("");
                    }

                }).catch(error => console.log("Search participant error: " + error));
        }, 1500);
    }

    const addParticipant = (e: MouseEvent<HTMLButtonElement>, participant_id: string, liAdded: number) => {
        e.preventDefault();
        let newArr = [...isAddParticipantSuccess];

        newArr[liAdded][participant_id] = true;
        setIsAddParticipantSuccess(newArr);

        setIsError(false);

        let newParticipantArr = [...projectParticipant];
        axios.post(server_domain + '/getParticipant', { participant_id: participant_id })
            .then((result: any) => {
                const user = result.data.user;

                newParticipantArr.push({
                    _id: user._id,
                    username: user.username,
                    photo: user.photo
                });

                setProjectParticipant(newParticipantArr);
            })
            .catch(error => console.log("Get participant error :" + error));
    }

    const removeParticipant = (e: MouseEvent<HTMLSpanElement>, particpantArrayIndex: number) => {
        e.preventDefault();
        let oldParticipantArr = [...projectParticipant];

        oldParticipantArr.splice(particpantArrayIndex, 1);
        setProjectParticipant(oldParticipantArr);
    }

    const saveProject = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let error = false;

        if (projectName == "") {
            setErrorMessage("Project name should not be empty.");
            error = true;
        } else if (projectParticipant.length < 1) {
            setErrorMessage("There is no participant for this project");
            error = true
        }

        if (error) {
            setIsError(error);
            return;
        }

        const participant: Array<string> = [];
        setBtnSaveLoading("active");

        projectParticipant.map((value) => {
            participant.push(value._id);
        });

        axios.post(server_domain + '/insertProject', { name: projectName, participant: participant, owner: userValues._id })
            .then(result => {
                if (result.data.valid) {
                    setBtnSaveDisable(true);
                    setTimeout(() => {
                        handleModalClose();
                        setIsSomethingAdded(!isSomethingAdded);
                    }, 2000);
                }
            }).catch(error => console.log('Project insertion error: ' + error));
    }

    const updateProject = () => {
        let error = false;

        if (projectName == "") {
            setErrorMessage("Project name should not be empty.");
            error = true;
        } else if (projectParticipant.length < 1) {
            setErrorMessage("There is no participant for this project");
            error = true
        }

        if (error) {
            setIsError(error);
            return;
        }

        const participant: Array<string> = [];
        setBtnSaveLoading("active");


        projectParticipant.map((value) => {
            participant.push(value._id);
        });


        axios.post(server_domain + '/updateProject', { name: projectName, participant: participant, project_id: projectId })
            .then(result => {
                console.log(result);
                if (result.data.valid) {
                    setBtnSaveDisable(true);
                    setTimeout(() => {
                        handleModalClose();
                        setIsSomethingAdded(!isSomethingAdded);
                    }, 2000);
                }
            }).catch(error => console.log('Project insertion error: ' + error));
    }

    const setConfirmationState = (index: number) => {
        let tmp = [...isDeleteConfirmationShow];
        tmp[index] = !tmp[index];
        setIsDeleteConfirmationShow(tmp);
    }

    const deleteConfirmation = (index_of_projects: number) => {
        setConfirmationState(index_of_projects);
    }

    const hideConfirmationDelete = (index_of_projects: number) => {
        setConfirmationState(index_of_projects);
    }

    const deleteProject = (project_id: string) => {
        axios.post(server_domain + "/deleteProject", { project_id: project_id })
            .then(result => {
                if (result.data.valid) {
                    setIsSomethingAdded(!isSomethingAdded);
                }
            }).catch(error => console.log('Delete project error: ' + error));
    }

    const navigateToTask = (project_id: string) => {
        navigate("/project/Task", { state: { id: project_id } });
    }

    return (
        <Home>
            <div className="project">
                <div className={"loading " + hideLoading}>
                    <img src="../src/assets/images/Walk.gif" alt="" />
                </div>
                {projectList.length == 0 ? (
                    <div className="empty-project">
                        <div className="folder-img">
                            <img src="./src/assets/images/folder.png" alt="" />
                        </div>
                        <p>No project created yet. <span onClick={handleModalShow}>Create new one.</span></p>
                    </div>
                ) :
                    <>
                        <div className="add-project" onClick={handleModalShow}>
                            <FontAwesomeIcon  icon={faFolderBlank} />
                        </div>
                        <div className="project-list">
                            {projectList.map((project, index) => {
                                return (
                                    <div className="project-item" key={index}>
                                        <div className="top-container">
                                            <div className="left">
                                                <img src={"./src/assets/images/folder_" + ((projectHasTask[index]) ? "withTask" : "noTask") + ".png"} alt="folder" onClick={() => navigateToTask(project._id)} />
                                                {(numberOfCurrentUserTaskInProject[project._id]) && 
                                                    <div className="notification-of-project">
                                                        <p>{numberOfCurrentUserTaskInProject[project._id]}</p>
                                                    </div>
                                                }
                                                <div className="project-title">
                                                    <p>{project.name}</p>
                                                </div>
                                                <div className={"delete-confirmation " + ((isDeleteConfirmationShow[index]) ? "show" : "")}>
                                                    <div className="title">
                                                        <p>Delete?</p>
                                                    </div>
                                                    <div className="button">
                                                        <button onClick={() => deleteProject(project._id)}>Yes</button>
                                                        <button onClick={() => hideConfirmationDelete(index)}>No</button>
                                                    </div>
                                                </div>
                                            </div>
                                            {(isProjectOwner[index]) &&
                                                <div className="right">
                                                    <div className="edit-icon">
                                                        <FontAwesomeIcon icon={faPenToSquare} onClick={() => editProject(project._id, project.name)}></FontAwesomeIcon>
                                                    </div>
                                                    <div className="bin-icon">
                                                        <FontAwesomeIcon icon={faTrashCan} onClick={() => deleteConfirmation(index)}></FontAwesomeIcon>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                }
            </div>

            <Modal show={show} onHide={handleModalClose} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="project-form">
                        <form>
                            <ErrorMessage message={errorMessage} isError={isError} />
                            <div className="fields">
                                <label ref={project_name_label_ref} htmlFor="name" className="label-animated" id="name-label">Project name</label>
                                <div className="input">
                                    <input type="text" name="name" id="name" className="name" value={projectName} onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={
                                        (e: FormEvent<HTMLInputElement>) => {
                                            setProjectName(e.currentTarget.value);
                                            setIsError(false);
                                        }
                                    } />
                                </div>
                                <div ref={project_name__field_tmp_ref} className="fields-tmp"></div>
                            </div>
                            <div className="fields" id="list_participant_container">
                                <label ref={project_participant_label_ref} htmlFor="participant" className="label-animated">Other participant to the project</label>
                                <div className="input">
                                    <input type="text" name="participant" id="participant" className="participant" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={searchParticipant} />
                                </div>
                                <div ref={poject_participant_field_tmp_ref} className="fields-tmp"></div>
                                <div  className={"list-all-participant " + showListUserSearch}>
                                    <div className={"loading " + hideLoading} >
                                        <img src="./src/assets/images/Walk.gif" alt="" />
                                    </div>
                                    <ul>
                                        {
                                            listSearch.map((value: any, index: number) => {
                                                const isAddSuccess = isAddParticipantSuccess[index];
                                                return (
                                                    <li key={value._id}>
                                                        <span><img src={value.userImageUrl} alt="profil" /></span>
                                                        <p>{value.username}</p>

                                                        <button className={((isAddSuccess && isAddSuccess[value._id]) ? "disabled" : "")} onClick={(e) => addParticipant(e, value._id, index)} >Add
                                                            <span className={((isAddSuccess && isAddSuccess[value._id]) ? "checked" : "")}><FontAwesomeIcon icon={faCheck} /></span></button>
                                                    </li>
                                                );
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                            <div className="participant-list">
                                <p>Parcticipant:</p>
                                {projectParticipant.length < 1 && <p className='no-participant-yet'>No participant for the project yet</p>}
                                <ul>
                                    {
                                        projectParticipant.map((value, index) => {
                                            return (
                                                <li key={value._id}>
                                                    <img src={value.photo} alt="participant-image" />
                                                    <span>{value.username}</span>
                                                    <span onClick={(e) => removeParticipant(e, index)}>x</span>
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="creator-list">
                        <p>Project Created by:</p>
                        <ul>
                            <li>
                                <img src={imageUrl} alt="profil" />
                            </li>
                        </ul>
                    </div>
                    <div className="button-modal">
                        <Button variant="primary" id="modal-btn-save" onClick={(e) => (!isEditProject) ? saveProject(e) : updateProject()} disabled={btnSaveDisabled}>
                            Save changes
                            <div className={"save-loading " + btnSaveLoading}></div>
                        </Button>
                        <Button variant="secondary" onClick={handleModalClose}>
                            close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Home>
    )
}
