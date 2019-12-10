import React, { Fragment, useState } from 'react';
// import axios from 'axios';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';

const Register = ({ setAlert, register, isAuthenticated }) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		cPassword: ''
	});

	const { name, email, password, cPassword } = formData;

	const onChange = e =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async e => {
		e.preventDefault();
		if (password !== cPassword) {
			setAlert('Passwords do not match.', 'danger');
		} else {
			register({ name, email, password });
		}
	};

	// Redirect if LOGGED IN
	if (isAuthenticated) {
		return <Redirect to='/dashboard' />;
	}

	return (
		<Fragment>
			<h1 className='large text-primary'>Sign up</h1>
			<p className='lead'>
				<i className='fas fa-user'></i>
				Creat your Account
			</p>
			<form className='form' onSubmit={e => onSubmit(e)}>
				<div className='form-group'>
					<input
						type='text'
						placeholder='Name'
						name='name'
						value={name}
						onChange={e => onChange(e)}
						//required
					/>
				</div>
				<div className='form-group'>
					<input
						name='email'
						type='email'
						placeholder='Email Adress'
						value={email}
						onChange={e => onChange(e)}
						//required
					/>
					<small className='form-text'>
						This site uses Gravatar, so if you want an profile image use a
						Gravatar email.
					</small>
				</div>
				<div className='form-group'>
					<input
						name='password'
						type='password'
						placeholder='Password'
						value={password}
						onChange={e => onChange(e)}
						//required
					/>
				</div>
				<div className='form-group'>
					<input
						name='cPassword'
						type='password'
						placeholder='Confirm Password'
						value={cPassword}
						onChange={e => onChange(e)}
						//required
					/>
				</div>
				<input type='submit' value='Register' className='btn btn-primary' />
			</form>
			<p className='my-1'>
				Already have an account?<Link to='login.html'>Login</Link>
			</p>
		</Fragment>
	);
};

Register.propTypes = {
	setAlert: PropTypes.func.isRequired,
	register: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
	isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { setAlert, register })(Register);
