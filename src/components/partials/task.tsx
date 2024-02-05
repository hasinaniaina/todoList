import { FocusEvent, createRef, useEffect, useState, MouseEvent, ChangeEvent } from "react"
import Home from "../../pages/home"
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useLocation } from "react-router-dom";
import ErrorMessage from "../errorMessage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faListAlt } from '@fortawesome/free-regular-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

interface TaskInterface {
  priority: string,
  status: string,
  member: {
    _id: string,
    username: string
  },
  project: string
}

export const Task = () => {
  const server_domain = import.meta.env.VITE_REACT_SERVER_DOMAIN;

  const location = useLocation();
  const project_id = location.state.id;

  const initializedData = {
    name: '',
    priority: '',
    status: '',
    member: '',
    project: project_id
  }

  const [task, setTask] = useState<Array<Record<string, string | any>>>([]);
  const [isTaskFilter, setIsTaskFilter] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [userValues, setUserValues] = useState<Array<Record<string, string | string>>>([]);
  const [btnSaveLoading, setBtnSaveLoading] = useState<string>("");
  const [btnSaveDisabled, setBtnSaveDisable] = useState<boolean>(false);
  const [showPriorityList, setShowPriorityList] = useState<boolean>(false);
  const [showStatusList, setShowStatusList] = useState<boolean>(false);
  const [showFilterPriorityList, setShowFilterPriorityList] = useState<boolean>(false);
  const [showFilterStatusList, setShowFilterStatusList] = useState<boolean>(false);
  const [showMemberList, setShowMemberList] = useState<boolean>(false);
  const [showFilterMemberList, setShowFilterMemberList] = useState<boolean>(false);
  const [memberValue, setMemberValue] = useState<string>("");
  // const [filterMemberValue, setFiterMemberValue] = useState<string>("");
  const [data, setData] = useState<Record<string, string>>(initializedData);
  const [filterData, setFilterData] = useState<Record<string, string>>(initializedData);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isEditTask, setIsEditTask] = useState<boolean>(false);
  const [isSomethingAdded, setIsSomethingAdded] = useState<boolean>(false);
  const [loadingDeleteSelected, setLoadingDeleteSelected] = useState<Array<boolean>>([]);
  const [isOwnerProject, setIsOwnerProject] = useState<boolean>(false);
  const [isCurrentTaskUserConnected, setIsCurrentTaskUserConnected] = useState<Array<boolean>>([]);



  const task_name_label_ref = createRef<HTMLLabelElement>();
  const task_name__field_tmp_ref = createRef<HTMLDivElement>();
  const task_priority_label_ref = createRef<HTMLLabelElement>();
  const task_priority_field_tmp_ref = createRef<HTMLDivElement>();
  const task_filter_priority_label_ref = createRef<HTMLLabelElement>();
  const task_filter_priority_field_tmp_ref = createRef<HTMLDivElement>();
  const task_status_label_ref = createRef<HTMLLabelElement>();
  const task_status_field_tmp_ref = createRef<HTMLDivElement>();
  const task_filter_status_label_ref = createRef<HTMLLabelElement>();
  const task_filter_status_field_tmp_ref = createRef<HTMLDivElement>();
  const task_member_label_ref = createRef<HTMLLabelElement>();
  const task_member_field_tmp_ref = createRef<HTMLDivElement>();
  const task_filter_member_label_ref = createRef<HTMLLabelElement>();
  const task_filter_member_field_tmp_ref = createRef<HTMLDivElement>();

  useEffect(() => {
    const rememberedUserId = sessionStorage.getItem('userId');

    axios.post(server_domain + '/getCurrentUser', { rememberedUserId: rememberedUserId })
      .then((current_user) => {
        const user_current_id = current_user.data.user._id;
        axios.post(server_domain + "/getTask", { project_id: project_id })
          .then((result) => {
            if (result) {
              const task: Array<TaskInterface> = result.data.result;
              const delete_list_tab = [];
              const user_task_owner = [];
              const task_filtered = taskAfterFiltering(task);
              const task_reorganise = reorganiseTask(task_filtered);

              for (let i = 0; i < task_reorganise.length; i++) {
                delete_list_tab.push(false);

                if (user_current_id.includes(task_reorganise[i].member._id)) {
                  user_task_owner.push(true);
                } else {
                  user_task_owner.push(false);
                }
              }

              setLoadingDeleteSelected(delete_list_tab);
              setTask(task_reorganise);
              setIsCurrentTaskUserConnected(user_task_owner);

              axios.post(server_domain + "/getUserProject", { project_id: project_id })
                .then((result) => {
                  const userProject = result.data.value;
                  const userTmp: Array<Record<string, string>> = [];

                  userProject.map((value: { user: {} }) => {
                    userTmp.push(value.user);
                  });

                  if (user_current_id == userProject[0]?.project.owner) {
                    setIsOwnerProject(true);
                  }

                  setUserValues(userTmp);

                }).catch(error => console.log("Get user and project task error: " + error));
            }
          }).catch(error => console.log("Get task error: " + error));
      }).catch(error => alert("Project participant creation error" + error));
  }, [isSomethingAdded]);

  const taskAfterFiltering = (task: Array<TaskInterface>) => {
    const priority_filter = filterData.priority;
    const status_filter = filterData.status;
    const member_filter = filterData.member;
    const task_to_filtre = [...task];

    if (isTaskFilter) {
      if (priority_filter != "") {
        filtrate(priority_filter, task_to_filtre, 'priority');
      }

      if (status_filter != "") {
        filtrate(status_filter, task_to_filtre, 'status');
      }

      if (member_filter != "") {
        filtrate(member_filter, task_to_filtre, 'member');
      }
    }

    return task_to_filtre;

  }

  const filtrate = (filter: string, task_to_filtre: any, field: "priority" | "status" | "member") => {
    let task_filtered = false

    while (!task_filtered) {
      if (task_to_filtre.length < 1) {
        task_filtered = true;
      }

      for (let i = 0; i < task_to_filtre.length; i++) {
        let task_tmp = (field.includes("member")) ? task_to_filtre[i].member['username'] : task_to_filtre[i][field];
        if (!task_tmp.includes(filter)) {
          task_to_filtre.splice(i, 1);
          task_filtered = false;
          break;
        } else {
          task_filtered = true;
        }
      };
    }
  }

  const refreshFilter = () => {
    task_filter_priority_label_ref.current?.classList.remove('active');
    task_filter_status_label_ref.current?.classList.remove('active');
    task_filter_member_label_ref.current?.classList.remove('active');

    setIsTaskFilter(false);
    setFilterData(initializedData);
    setIsSomethingAdded(!isSomethingAdded);

  }

  const reorganiseTask = (task: Array<TaskInterface>) => {
    const task_reorganise = []
    const priority = [
      "High",
      "Medium",
      "Low"
    ];

    for (let i = 0; i < priority.length; i++) {
      for (let j = 0; j < task.length; j++) {
        if (task[j].priority.includes(priority[i])) {
          task_reorganise.push(task[j]);
        }
      }
    }

    return task_reorganise;
  }

  const handleModalShow = () => {
    setShow(true);

    setTimeout(() => {
      setInputLabelOnTop(false);
      initializedData.priority = "Low";
      initializedData.status = " In progress";
      setData(initializedData);
    }, 1000)

  }


  const handleModalClose = () => {
    setShow(false);
    setMemberValue("");
    setData(initializedData);
    setBtnSaveDisable(false);
    setBtnSaveLoading("");
    setIsError(false);
    setIsSomethingAdded(!isSomethingAdded);
    setIsEditTask(false);
  }
  const increaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
    const input_focused_class: string = e.currentTarget.classList.value;

    if (input_focused_class.includes("name")) {
      task_name_label_ref.current?.classList.add('active');
      task_name__field_tmp_ref.current?.classList.add('active');

    } else if (input_focused_class.includes("priority")) {
      // setInputLabelOnTop(false);
      setShowPriorityList(true);
      task_priority_field_tmp_ref.current?.classList.add('active');

    } else if (input_focused_class.includes("status")) {
      setShowStatusList(true);
      task_status_field_tmp_ref.current?.classList.add('active');

    } else {
      setShowMemberList(true);
      task_member_field_tmp_ref.current?.classList.add('active');
      task_member_label_ref.current?.classList.add('active');
    }

    if (input_focused_class.includes('filter-priority')) {
      setShowFilterPriorityList(true);
      task_filter_priority_label_ref.current?.classList.add('active');
      task_filter_priority_field_tmp_ref.current?.classList.add('active');

    } else if (input_focused_class.includes('filter-status')) {
      setShowFilterStatusList(true);
      task_filter_status_label_ref.current?.classList.add('active');
      task_filter_status_field_tmp_ref.current?.classList.add('active');

    } else if (input_focused_class.includes('filter-member')) {
      setShowFilterMemberList(true);
      task_filter_member_label_ref.current?.classList.add('active');
      task_filter_member_field_tmp_ref.current?.classList.add('active');

    }

    setIsError(false);
  }



  const decreaseTopOfLabel = (e: FocusEvent<HTMLInputElement>) => {
    const input_blured_class = e.currentTarget.classList.value;
    const value = e.currentTarget.value;


    if (input_blured_class.includes("name")) {
      if (value == "") {
        task_name_label_ref.current?.classList.remove('active');
      }
    } else if (input_blured_class.includes("priority")) {
      setTimeout(() => {
        if (value == "") {
          task_priority_label_ref.current?.classList.remove('active');
        }

        setShowPriorityList(false);

      }, 500);
    } else if (input_blured_class.includes("status")) {
      setTimeout(() => {
        if (value == "") {
          task_status_label_ref.current?.classList.remove('active');
        }

        setShowStatusList(false);
      }, 500);
    } else {
      setTimeout(() => {
        if (value == "") {
          task_member_label_ref.current?.classList.remove('active');
        }

        setShowMemberList(false);
      }, 500);
    }

    if (input_blured_class.includes('filter-priority')) {
      setTimeout(() => {
        if (value == "") {
          task_filter_priority_label_ref.current?.classList.remove('active');
        }
        setShowFilterPriorityList(false);
      }, 500);

    } else if (input_blured_class.includes('filter-status')) {

      setTimeout(() => {
        if (value == "") {
          task_filter_status_label_ref.current?.classList.remove('active');
        }
        setShowFilterStatusList(false);
      }, 500);
    } else if (input_blured_class.includes('filter-member')) {
      setTimeout(() => {
        if (value == "") {
          task_filter_member_label_ref.current?.classList.remove('active');
        }
        setShowFilterMemberList(false);
      }, 500);
    }

    task_priority_field_tmp_ref.current?.classList.remove('active');
    task_status_field_tmp_ref.current?.classList.remove('active');
    task_member_field_tmp_ref.current?.classList.remove('active');
    task_name__field_tmp_ref.current?.classList.remove('active');
    task_filter_priority_field_tmp_ref.current?.classList.remove('active');
    task_filter_status_field_tmp_ref.current?.classList.remove('active');
    task_filter_member_field_tmp_ref.current?.classList.remove('active');
  }



  const avoidTapInInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.currentTarget.value = "";
  }

  const setInputLabelOnTop = (isEdit: boolean) => {
    const task_name = document.getElementById("taskName-label");
    const task_priority = document.getElementById("taskPriority-label");
    const task_status = document.getElementById("taskStatus-label");
    const task_member = document.getElementById("taskMember-label");

    if (isEdit) {
      task_name?.classList.add('active');
      task_member?.classList.add('active');
    }

    task_priority?.classList.add('active');
    task_status?.classList.add('active');
  }

  const assignValue = (e: MouseEvent<HTMLParagraphElement>) => {
    const field_class = e.currentTarget.className;
    const field = field_class.split('-')[0];
    const value = e.currentTarget.innerHTML;

    if (field_class.includes("priority-item") || field_class.includes("status-item")) {
      setData({
        ...data,
        [field]: value
      });
    } else {
      setMemberValue(value);
    }
  }

  const assignFilterValue = (e: MouseEvent<HTMLParagraphElement>) => {
    const field_class = e.currentTarget.className;
    const field = field_class.split('-')[0];
    const value = e.currentTarget.innerHTML;

    setFilterData(({
      ...filterData,
      [field]: value
    }));

    setIsTaskFilter(true);
    setIsSomethingAdded(!isSomethingAdded);
  }


  const assignMemberId = (member_id: string) => {
    setData({
      ...data,
      ['member']: member_id,
    });
  }

  const editTask = (task_id: string) => {
    let task_selected: Record<string, string | any> = {
      _id: "",
      name: "",
      priority: "",
      status: "",
      member: {},
      project: ""
    };

    setShow(true);
    setData(task_selected);
    setIsEditTask(true);

    task.map(value => {
      if (value._id == task_id) {
        task_selected = value;
      }
    });



    setTimeout(() => {
      setInputLabelOnTop(true);
      setData(task_selected);
      setMemberValue(task_selected.member['username']);
    }, 1000);
  }

  const updateTask = () => {
    if (data.name == "") {
      setErrorMessage("Task name should not be empty.");
      setIsError(true);
      return;
    }

    setBtnSaveLoading("active");
    setBtnSaveDisable(true);
    axios.post(server_domain + '/updateTask', { task: data })
      .then(result => {
        const updated = result.data.valid;
        if (updated) {
          setTimeout(() => {
            handleModalClose();
          }, 2000);
        }
      }).catch(error => console.log("Update task error: " + error));
  }

  const saveTask = (save_close: boolean) => {
    let error = false;
    if (data.name == "") {
      setErrorMessage("Task name should not be empty.")
      error = true;
    } else if (data.member == "") {
      setErrorMessage("Task name should not be empty.")
      error = true;
    }

    if (error) {
      setIsError(true);
      return;
    }

    setBtnSaveLoading("active");
    setBtnSaveDisable(true);

    axios.post(server_domain + '/insertTask', { task: data })
      .then((result) => {
        if (result.data.valid) {
          setTimeout(() => {

            if (save_close) {
              setShow(false);
            }


            initializedData.priority = "Low";
            initializedData.status = " In progress";
            setData(initializedData);
            setMemberValue("");
            setBtnSaveDisable(false);
            setBtnSaveLoading("");
            setIsError(false);
            setIsSomethingAdded(!isSomethingAdded);
            setIsEditTask(false);

          }, 2000);
        }
      }).catch(error => console.log("Insert Task error: " + error));
  }

  const deleteTask = (task_id: string, index: number) => {
    const tmp = [...loadingDeleteSelected];
    tmp[index] = true;

    setLoadingDeleteSelected(tmp);

    axios.post(server_domain + '/deleteTask', { id: task_id })
      .then((result) => {
        const valid = result.data.valid;
        if (valid) {
          setTimeout(() => {
            setIsSomethingAdded(!isSomethingAdded);
          }, 2000);
        }
      }).catch(error => console.log("Delete task error: " + error));
  }

  return (
    <Home>
      <>
        <div className="task">
          {(task.length > 0 || isTaskFilter) ? (
            <>
              <div className="filter-by">
                <p>Filter by:</p>
                <div className="fields">
                  <label htmlFor="filter-priority" ref={task_filter_priority_label_ref} className="label-animated" id="taskFilterPriority-label">Priority</label>
                  <div className="input">
                    <input type="text" name="filter-priority" id="filter-priority" value={filterData.priority} className={"filter-priority"} onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={(e) => avoidTapInInput(e)} />
                    <div className={"filter-value-priority " + filterData.priority}>
                      <p>{filterData.priority}</p>
                    </div>
                    <ul className={"filter-priority-list " + ((showFilterPriorityList) ? "active" : "")}>
                      <li><p onClick={(e) => assignFilterValue(e)} className="priority-item">Low</p></li>
                      <li><p onClick={(e) => assignFilterValue(e)} className="priority-item">Medium</p></li>
                      <li><p onClick={(e) => assignFilterValue(e)} className="priority-item">High</p></li>
                    </ul>
                  </div>
                  <div ref={task_filter_priority_field_tmp_ref} className="fields-tmp"></div>
                </div>
                <div className="fields">
                  <label htmlFor="filter-status" ref={task_filter_status_label_ref} className="label-animated" id="taskFilterStatus-label">Status</label>
                  <div className="input">
                    <input type="text" name="filter-status" id="filter-status" value={filterData.status} className="filter-status" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={(e) => avoidTapInInput(e)} />
                    <div className={"filter-value-status " + filterData.status.trim().toLocaleLowerCase().replace(/ /g, '_')}>
                      <p>{filterData.status}</p>
                    </div>
                    <ul className={"filter-status-list " + ((showFilterStatusList) ? "active" : "")}>
                      <li><p onClick={(e) => assignFilterValue(e)} className="status-item in-progress">In progress</p></li>
                      <li><p onClick={(e) => assignFilterValue(e)} className="status-item pending_validation">Pending validation</p></li>
                      <li ><p onClick={(e) => assignFilterValue(e)} className="status-item complete">Complete</p></li>
                    </ul>
                  </div>
                  <div ref={task_filter_status_field_tmp_ref} className="fields-tmp"></div>
                </div>
                <div className="fields">
                  <label htmlFor="filter-member" ref={task_filter_member_label_ref} className="label-animated" id="taskFilterMember-label">Team member</label>
                  <div className="input">
                    <input type="text" name="filter-member" value={filterData.member} id="filtermember" className={"filter-member "} onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={(e) => avoidTapInInput(e)} />
                    <ul className={"filter-member-list " + ((showFilterMemberList) ? "active" : "")}>
                      {userValues.map((user, index) => {
                        return (
                          <li key={index}>
                            <img src={user.photo} alt="avatar" />
                            <p onClick={(e) => {
                              assignFilterValue(e);
                              // assignFilterMemberId(user._id);
                            }} className="member-item">{user.username}</p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div ref={task_member_field_tmp_ref} className="fields-tmp"></div>
                </div>
                <div className="not-fields">
                  <div className="reset">
                    <FontAwesomeIcon icon={faArrowsRotate} onClick={refreshFilter} />
                  </div>
                </div>
              </div>
              <div className="task-tab-container">
                {(isOwnerProject) &&
                  <div className="add-task" onClick={handleModalShow}>
                    <FontAwesomeIcon icon={faListAlt} />
                  </div>
                }
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Team member</th>
                      <th scope="col">Task</th>
                      <th scope="col">Priority</th>
                      <th scope="col">Status</th>
                      <th scope="col"> Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.map((value, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row">
                            <p>{index}</p>
                          </th>
                          <td className={(isCurrentTaskUserConnected[index]) ? "current-user-task" : ""}>
                            <div className="team-member-column">
                              <img src={value.member['photo' as any]} alt="avatar" />
                              <p className={(value.status.includes('Complete') ? "task-complete" : "")}>{value.member['username' as any]}</p>
                            </div>
                          </td>
                          <td className={(isCurrentTaskUserConnected[index]) ? "current-user-task" : ""}>
                            <p className={(value.status.includes('Complete') ? "task-complete" : "")}>{value.name}</p>
                          </td>
                          <td className={"priority " + ((isCurrentTaskUserConnected[index]) ? "current-user-task" : "")}>
                            <p className={value.priority}>{value.priority}</p>
                          </td>
                          <td className={"status " + ((isCurrentTaskUserConnected[index]) ? "current-user-task" : "")}>
                            <p className={value.status.trim().toLocaleLowerCase().replace(/ /g, '_')}>{value.status}</p>
                          </td>
                          <td className={(isCurrentTaskUserConnected[index]) ? "current-user-task" : ""}>
                            <div className="action">
                              <div className={"delete-confirmation " + ((loadingDeleteSelected[index]) ? "active" : "")}>
                                <img src="../src/assets/images/loading-delete.gif" alt="loading" />
                              </div>
                              <div className="edit">
                                <FontAwesomeIcon icon={faPenToSquare} onClick={() => editTask(value._id)}></FontAwesomeIcon>
                              </div>
                              {(isOwnerProject) &&
                                <div className="delete">
                                  <FontAwesomeIcon icon={faTrashCan} onClick={() => deleteTask(value._id, index)}></FontAwesomeIcon>
                                </div>
                              }
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

              </div>
            </>
          ) : (
            <div className="empty-task">
              <div className="task-img">
                <img src="../src/assets/images/empty_task.png" alt="Empty task" />
              </div>
              <p>No Task created for this project. <span onClick={handleModalShow}>Create new One</span></p>
            </div>
          )}
        </div>
      </>
      <Modal show={show} onHide={handleModalClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="task-form">
            <form>
              {<ErrorMessage message={errorMessage} isError={isError} />}
              <div className="fields">
                <label htmlFor="name" ref={task_name_label_ref} className="label-animated" id="taskName-label">Task name</label>
                <div className="input">
                  <input type="text" name="name" id="name" className={"name " + ((!isOwnerProject) ? "task-input-disabled" : "")} value={data.name} onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={(e) => {
                    setData({
                      ...data,
                      ['name']: e.target.value
                    });
                  }} disabled={!isOwnerProject} />
                </div>
                <div ref={task_name__field_tmp_ref} className="fields-tmp"></div>
              </div>

              <div className="fields">
                <label htmlFor="priority" ref={task_priority_label_ref} className="label-animated" id="taskPriority-label">Priority</label>
                <div className="input">
                  <input type="text" name="priority" value={data.priority} id="priority" className={"priority " + ((!isOwnerProject) ? "task-input-disabled" : "")} onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={(e) => avoidTapInInput(e)} disabled={!isOwnerProject} />
                  <div className={"value-priority " + data.priority}>
                    <p>{data.priority}</p>
                  </div>
                  <ul className={"priority-list " + ((showPriorityList) ? "active" : "")}>
                    <li><p onClick={(e) => assignValue(e)} className="priority-item">Low</p></li>
                    <li><p onClick={(e) => assignValue(e)} className="priority-item">Medium</p></li>
                    <li><p onClick={(e) => assignValue(e)} className="priority-item">High</p></li>
                  </ul>
                </div>
                <div ref={task_priority_field_tmp_ref} className="fields-tmp"></div>
              </div>

              <div className="fields">
                <label htmlFor="status" ref={task_status_label_ref} className="label-animated" id="taskStatus-label">Status</label>
                <div className="input">
                  <input type="text" name="status" value={data.status} id="status" className="status" onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={(e) => avoidTapInInput(e)} />
                  <div className={"value-status " + (data.status.trim().toLocaleLowerCase().replace(/ /g, '_'))}>
                    <p>{data.status}</p>
                  </div>
                  <ul className={"status-list " + ((showStatusList) ? "active" : "")}>
                    <li><p onClick={(e) => assignValue(e)} className="status-item in-progress">In progress</p></li>
                    <li className={(!isEditTask) ? "hide-status" : ""}><p onClick={(e) => assignValue(e)} className="status-item pending_validation">Pending validation</p></li>
                    <li className={(!isEditTask) ? "hide-status" : ""}><p onClick={(e) => assignValue(e)} className="status-item complete">Complete</p></li>
                  </ul>
                </div>
                <div ref={task_status_field_tmp_ref} className="fields-tmp"></div>
              </div>

              <div className="fields">
                <label htmlFor="member" ref={task_member_label_ref} className="label-animated" id="taskMember-label">Team member</label>
                <div className="input">
                  <input type="text" name="member" value={memberValue} id="member" className={"member " + ((!isOwnerProject) ? "task-input-disabled" : "")} onFocus={(e) => increaseTopOfLabel(e)} onBlur={(e) => decreaseTopOfLabel(e)} onChange={(e) => avoidTapInInput(e)} disabled={!isOwnerProject} />
                  <ul className={"member-list " + ((showMemberList) ? "active" : "")}>
                    {userValues.map((user, index) => {
                      return (
                        <li key={index}>
                          <img src={user.photo} alt="avatar" />
                          <p onClick={(e) => {
                            assignValue(e);
                            assignMemberId(user._id);
                          }} className="member-item">{user.username}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div ref={task_member_field_tmp_ref} className="fields-tmp"></div>
              </div>
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {(!isEditTask) ? (
            <div className="button-modal">
              <Button variant="primary" id="modal-btn-save" onClick={() => saveTask(false)} disabled={btnSaveDisabled}>
                Save changes
                <div className={"save-loading " + btnSaveLoading}></div>
              </Button>
              <Button variant="danger" id="modal-btn-save" onClick={() => saveTask(true)} disabled={btnSaveDisabled}>
                Save changes and close
                <div className={"save-close-loading " + btnSaveLoading}></div>
              </Button>
              <Button variant="secondary" onClick={handleModalClose}>
                close
              </Button>

            </div>
          ) : (
            <div className="button-modal">
              <Button variant="primary" id="modal-btn-save" onClick={() => updateTask()} disabled={btnSaveDisabled}>
                Save changes
                <div className={"save-loading " + btnSaveLoading}></div>
              </Button>

              <Button variant="secondary" onClick={handleModalClose}>
                close
              </Button>

            </div>
          )
          }
        </Modal.Footer>
      </Modal>
    </Home>
  )
}
