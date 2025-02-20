import React from "react";
import "./App.css"
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const StudentRegistrationForm = () => {
  const initialValues = {
    name: "",
    age: "",
    email: "",
    course: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Too short!")
      .max(50, "Too long!")
      .required("Required"),
    age: Yup.number()
      .min(10, "Too young!")
      .max(100, "Invalid age!")
      .required("Required"),
    email: Yup.string().email("Invalid email format").required("Required"),
    course: Yup.string().required("Please select a course"),
  });

  const handleSubmit = (values, { resetForm }) => {
    console.log("Form Data:", values);
    resetForm();
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-sm-5 p-3 m-md-5">
        <h2 className="text-center mb-4">Student Registration Form</h2>
        <Formik initialValues={initialValues} validationSchema={validationSchema} 
        onSubmit={handleSubmit}>
          {() => (
            <Form>
              <div className="mb-4 p-2">
                <label className="form-label mb-0">Name</label>
                <Field
                  type="text"
                  name="name"
                  className="form-control border-0 border-bottom border-black rounded-0"
                  placeholder="Enter your name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger position-absolute"
                />
              </div>

              <div className="mb-4 p-2">
                <label className="form-label">Age</label>
                <Field
                  type="number"
                  name="age"
                  className="form-control border-0 border-bottom border-black rounded-0"
                  placeholder="Enter your Age"
                />
                <ErrorMessage
                  name="age"
                  component="div"
                  className="text-danger position-absolute"
                />
              </div>

              <div className="mb-4 p-2">
                <label className="form-label">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="form-control border-0 border-bottom border-black rounded-0"
                  placeholder="Enter your email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger position-absolute"
                />
              </div>

              <div className="mb-4 p-2">
                <label className="form-label">Course</label>
                <Field
                  as="select"
                  name="course"
                  className="form-select border-0 border-bottom border-black rounded-0"
                >
                  <option value="">Select a course</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                </Field>
                <ErrorMessage
                  name="course"
                  component="div"
                  className="text-danger position-absolute"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-4">
                Submit
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;
