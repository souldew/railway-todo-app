import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import { format, parse } from "date-fns";
import PropTypes from "prop-types";
import "./home.scss";

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== "undefined") {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  const handleKeyDown = (event, id) => {
    // event.preventDefault();
    console.log("ok");
    if (event.key == "Enter") {
      handleSelectList(id);
    }
  };
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    handleKeyDown(e, list.id);
                  }}
                  key={key}
                  className={`list-tab-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectList(list.id)}
                  style={{ cursor: "pointer" }}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
// Tasks.propTypes = {
//   tasks: PropTypes.string.isRequired,
//   selectListId: PropTypes.string.isRequired,
//   isDoneDisplay: PropTypes.string.isRequired,
// };
const Tasks = (props) => {
  const formatLimit = (limit) => {
    if (limit == undefined) {
      return;
    }
    const formattedLimit = format(
      parse(limit, "yyyy-MM-dd'T'HH:mm:ss'Z'", new Date()),
      "yyyy-MM-dd HH:mm",
    );
    return `期限: ${formattedLimit}`;
  };
  const calcDiff = (limit) => {
    if (limit == undefined) {
      return;
    }

    const formattedLimit = parse(limit, "yyyy-MM-dd'T'HH:mm:ss'Z'", new Date());
    const current = (() => {
      const ret = new Date();
      ret.setSeconds(0);
      return ret;
    })();
    const diffTime = formattedLimit - current;
    if (diffTime < 0) {
      return "期限切れ";
    }
    const restDates = parseInt(diffTime / (1000 * 60 * 60 * 24));
    const restHours = parseInt((diffTime / (1000 * 60 * 60)) % 24);
    const restMinutes = parseInt((diffTime / (1000 * 60)) % 60);
    return `残り: ${restDates}日${restHours}時間${restMinutes}分`;
  };

  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;
  if (isDoneDisplay == "done") {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => {
            return (
              <li key={key} className="task-item">
                <Link
                  to={`/lists/${selectListId}/tasks/${task.id}`}
                  className="task-item-link"
                >
                  {task.title}
                  <br />
                  {task.done ? "完了" : "未完了"}
                </Link>
              </li>
            );
          })}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              <div
                style={{
                  display: "flex",
                  gap: "0 100px",
                  marginRight: "1rem",
                  alignItems: "stretch",
                }}
              >
                <div style={{ marginRight: "auto" }}>
                  {task.done ? "完了" : "未完了"}
                </div>
                <div className="limit-grid">
                  <div className="limit-time">{formatLimit(task.limit)}</div>
                  <div className="rest-time">{calcDiff(task.limit)}</div>
                </div>
              </div>
            </Link>
          </li>
        ))}
    </ul>
  );
};
