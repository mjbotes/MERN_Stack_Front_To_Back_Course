import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
	return (
		<section className='landing'>
			<div className='dark-overlay'>
				<div className='landing-inner'>
					<h1 className='x-large'>Developer Connector</h1>
					<p className='lead'>
						Create Developper Profile/Portfolio share posts and get help from
						other Developers.
					</p>
					<div className='buttons'>
						<Link to='/register' className='btn btn-primary'>
							Sign up
						</Link>
						<Link to='/login' className='btn'>
							login
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Landing;
