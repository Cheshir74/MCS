import React from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";


function App() {
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm({
    criteriaMode: "all"
  });
  const onSubmit = (data) => console.log(data);

  return (
    <form className="contact100-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="wrap-input100">
				<input {...register('name', { required: true, minLength: 2 })}
        className="input100 true-validate" placeholder="Full Name"/>
        {errors.name && errors.name.type === "required" && <p>This is required</p> }      
        {errors.name && errors.name.type === "minLength" && <p>At least 2 characters</p> }
			</div>
      

      <div className="wrap-input100 validate-input" data-validate = "Please enter email: e@a.x">
				<input {...register("email", {
          required: true,
          pattern: {
            value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: 'Please enter a valid email',
          }
        })}
        type="email"
      
        className="input100" name="email" placeholder="Email"/>     
        {errors.email && <p>Please enter a valid email</p> }
			</div>

			<div className="wrap-input100 validate-input" data-validate = "Please enter your message">
				<textarea 
          {...register("message", { required: true, minLength: 10 })}
        className="input100" name="message" placeholder="Your Message"></textarea>
        {errors.message && errors.message.type === "required" && <p>This is required</p> }      
        {errors.message && errors.message.type === "minLength" && <p>At least 10 characters</p> }
			</div>

			<div className="container-contact100-form-btn">
				<button className="contact100-form-btn">
					Send Email
				</button>
			</div>
    </form>
  );
}

const rootElement = document.getElementById("contact-form");
ReactDOM.render(<App />, rootElement);
