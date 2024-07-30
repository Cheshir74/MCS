import React, {useState, useRef} from "react";
import { useForm } from "react-hook-form";
import { createRoot } from "react-dom/client";

const UserForm = props => {
  const [isSended, setIsSended] = useState(false);
  const {
    register,
    formState: { errors } 
  } = useForm({
    criteriaMode: "all",
  });

    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    const form = useRef(null)

    const submit = e => {
      e.preventDefault()
      const data = new FormData(form.current)
      fetch('/message', { method: 'POST', body: data } )
      .then(res => res.json())
      .then(
        (result) => {
          setIsSended(true);
        })
    }
  if (isSended) {
    return (
      <form className="contact100-form" ref={form} onSubmit={submit} >
        
        Message sent! Thank you!

      </form>
    );
  }
  else {
    return (
      <form className="contact100-form" ref={form} onSubmit={submit} >
        <input type='hidden' name='authenticity_token' value={csrfToken} />
        <div className="wrap-input100">
          <input {...register('name', { required: true, minLength: 2 })}
          className="input100 true-validate" autoComplete="off" placeholder="Full Name"/>
          {errors.name && errors.name.type === "required" && <p>This is required</p> }      
          {errors.name && errors.name.type === "minLength" && <p>At least 2 characters</p> }
        </div>
        

        <div className="wrap-input100 validate-input"  data-validate = "Please enter email: e@a.x">
          <input {...register("email", {
            required: true,
            pattern: {
              value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: 'Please enter a valid email',
            }
          })}
          type="email"
        
          className="input100" autoComplete="off" name="email" placeholder="Email"/>     
          {errors.email && <p>Please enter a valid email</p> }
        </div>

        <div className="wrap-input100 validate-input"  data-validate = "Please enter your message">
          <textarea 
            {...register("body", { required: true, minLength: 10 })}
          className="input100" name="body" placeholder="Your Message"></textarea>
          {errors.body && errors.body.type === "required" && <p>This is required</p> }      
          {errors.body && errors.body.type === "minLength" && <p>At least 10 characters</p> }
        </div>

        <div className="container-contact100-form-btn">
          <button className="contact100-form-btn" type='submit' >
            Send Email
          </button>
        </div>
      </form>
    );
  }

}

const rootElement = document.getElementById("contact-form");
createRoot(rootElement).render(<UserForm />);
