import React from "react";
import { Form, Input, Modal, Typography, Result } from "antd";
import { BASE_URL } from "./Layout";

const UserCreateForm = ({
  logIn,
  open,
  setOpen,
  signUp,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [formStates, setFormStates] = React.useState([]);
  React.useEffect(() => {
    // Validate the passwords
    if (!("password" in formStates) && !("confirmPassword" in formStates)) {
      setPassword((prevPassword) => ({
        validateStatus: "",
        errorMsg: null,
      }));
      setConfirmPassword((prevConfirmPassword) => ({
        validateStatus: "",
        errorMsg: null,
      }));
    } else if (formStates.password === formStates.confirmPassword) {
      setPassword((prevPassword) => ({
        validateStatus: "success",
        errorMsg: null,
      }));
      setConfirmPassword((prevConfirmPassword) => ({
        validateStatus: "success",
        errorMsg: null,
      }));
    } else {
      setPassword((prevPassword) => ({
        validateStatus: "error",
        errorMsg: "password not match!",
      }));
      setConfirmPassword((prevConfirmPassword) => ({
        validateStatus: "error",
        errorMsg: "password not match!",
      }));
    }
  }, [formStates]);

  const onValuesChange = (values) => {
    // Record the form field values as states
    let tempFormStates = structuredClone(formStates);
    if ("password" in values) {
      tempFormStates.password = values.password;
    } else if ("confirmPassword" in values) {
      tempFormStates.confirmPassword = values.confirmPassword;
    }
    setFormStates(tempFormStates);
  };
  const onCancel = () => {
    // Reset modal fields
    form.resetFields();
    setUsername({
      validateStatus: "",
      errorMsg: null,
    });
    setPassword({
      validateStatus: "",
      errorMsg: null,
    });
    setConfirmPassword({
      validateStatus: "",
      errorMsg: null,
    });
    // Close the modal
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      title="Register"
      okText="Submit"
      cancelText="Cancel"
      destroyOnClose={true}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            if (
              (password.validateStatus === "success" &&
                confirmPassword.validateStatus === "success") ||
              (password.validateStatus === "warning" &&
                confirmPassword.validateStatus === "warning")
            ) {
              // Trigger the loading animation
              setConfirmLoading(true);

              // Sign user up
              const callbackfunc = await signUp(values);
              const [response, data] = callbackfunc();

              // Submit button loading animation period
              setTimeout(function () {
                // Initiate 'submit' button loading
                setConfirmLoading((state) => false);

                // If there are errors
                if (response.status === 400) {
                  if ("password" in data) {
                    if ("username" in data) {
                      setUsername({
                        validateStatus: "error",
                        errorMsg: data.username,
                      });
                    } else {
                      setUsername({
                        validateStatus: "success",
                        errorMsg: null,
                      });
                    }
                    setPassword({
                      validateStatus: "error",
                      errorMsg: data.password,
                    });
                    setConfirmPassword({
                      validateStatus: "error",
                      errorMsg: null,
                    });
                  } else if ("username" in data) {
                    setUsername({
                      validateStatus: "error",
                      errorMsg: data.username,
                    });
                    setPassword({
                      validateStatus: "success",
                      errorMsg: null,
                    });
                    setConfirmPassword({
                      validateStatus: "success",
                      errorMsg: null,
                    });
                  }
                } else if (response.status === 500) {
                  setPassword({
                    validateStatus: "warning",
                    errorMsg: "Server error",
                  });
                  setConfirmPassword({
                    validateStatus: "warning",
                    errorMsg: null,
                  });
                } else if (response.status === 201) {
                  // If user signed up successfully
                  // Clear the form fields
                  form.resetFields();
                  setConfirmPassword({
                    validateStatus: "success",
                    errorMsg: null,
                  });
                  setPassword({
                    validateStatus: "success",
                    errorMsg: null,
                  });
                  setConfirmPassword({
                    validateStatus: "success",
                    errorMsg: null,
                  });
                  setOpen(false);

                  // Log User In
                  const userCredentials = {
                    username: values.username,
                    password: values.password,
                  };
                  logIn(userCredentials);
                } else {
                  // Something is wrong
                  setPassword({
                    validateStatus: "warning",
                    errorMsg: "Something is wrong",
                  });
                  setConfirmPassword({
                    validateStatus: "warning",
                    errorMsg: "Something is wrong",
                  });
                }
              }, 2000);
            }
          })
          .catch((info) => {});
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        onValuesChange={onValuesChange}
      >
        <Form.Item
          name="username"
          label="Username"
          validateStatus={username.validateStatus}
          help={username.errorMsg}
          rules={[{ required: true, message: "Username is required!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          hasFeedback
          validateStatus={password.validateStatus}
          help={password.errorMsg}
          rules={[{ required: true, message: "Password is required!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          hasFeedback
          validateStatus={confirmPassword.validateStatus}
          help={confirmPassword.errorMsg}
          rules={[
            {
              required: true,
              message: "Please input the same password again!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function RegisterForm({ logIn, open, setOpen, showTrigger = true }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  // Stay backward compatible: fall back to internal state when the parent does not control the modal
  const modalOpen = open === undefined ? internalOpen : open;
  const setModalOpen = setOpen === undefined ? setInternalOpen : setOpen;
  const [username, setUsername] = React.useState({
    validateStatus: "",
    errorMsg: null,
  });
  const [password, setPassword] = React.useState({
    validateStatus: "",
    errorMsg: null,
  });
  const [confirmPassword, setConfirmPassword] = React.useState({
    validateStatus: "",
    errorMsg: null,
  });

  const signUp = async (values) => {
    let ignore = false;

    if (!ignore) {
      // Wait for response
      const response = await fetch(BASE_URL + "api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      return () => {
        ignore = true;
        return [response, data];
      };
    }
    return;
  };

  return (
    <div>
      {showTrigger ? (
        <Result
          status="info"
          title="Please Login first!"
          extra={[
            <Typography.Text key="registerInfoText">New user?</Typography.Text>,
            <a
              key="registerInfoAnchor"
              href=""
              onClick={(e) => {
                // Prevent website from refreshing
                e.preventDefault();
                // Open modal
                setModalOpen(true);
              }}
            >
              Register here
            </a>,
          ]}
        />
      ) : null}

      <UserCreateForm
        logIn={logIn}
        open={modalOpen}
        setOpen={setModalOpen}
        signUp={signUp}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
      />
    </div>
  );
}

export default RegisterForm;
