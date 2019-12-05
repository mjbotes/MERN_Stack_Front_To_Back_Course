import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});

	const { email, password } = formData;

	const onChange = e =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async e => {
		e.preventDefault();
		console.log('success');
	};

	return (
		<Fragment>
			<h1 className='large text-primary'>Sign In</h1>
			<p className='lead'>
				<i className='fas fa-user'></i>
				Login to your Account
			</p>
			<form className='form' onSubmit={e => onSubmit(e)}>
				<div className='form-group'>
					<input
						name='email'
						type='email'
						placeholder='Email Adress'
						value={email}
						onChange={e => onChange(e)}
						required
					/>
				</div>
				<div className='form-group'>
					<input
						name='password'
						type='password'
						placeholder='Password'
						value={password}
						onChange={e => onChange(e)}
						required
					/>
				</div>
				<input type='submit' value='Login' className='btn btn-primary' />
			</form>
			<p className='my-1'>
				Don't have an account?<Link to='/login'>Login</Link>
			</p>
		</Fragment>
	);
};

export default Login;
