import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className='footer-content'>
            <div className='footer-content-left'>
                <img src={assets.logo} width={180} height={100} alt=''/>
                <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dignissimos earum asperiores natus neque possimus eos odit dolor enim eveniet necessitatibus, libero nihil iste autem beatae doloribus suscipit quam eligendi placeat?</p>
               <div className='footer-social-icons'>
                  <img src={assets.facebook_icon} alt=''/>
                  <img src={assets.twitter_icon} alt=''/>
                  <img src={assets.linkedin_icon} alt=''/>
               </div>
            </div>
            <div className='footer-content-center'>
                 <h2>COMPANY</h2>
                 <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                 </ul>
            </div>
            <div className='footer-content-right'>
               <h2>GET IN TOUCH</h2>
               <ul>
                <li>+1-212-465-7980</li>
                <li>contact@mamtabhojnalaya.com</li>
               </ul>
            </div>
        </div>
       <hr/>
       <p className='footer-copyright'>Copyright 2025 ©️ MamtaBhojnalaya.com - All Right Reserved.</p>
    </div>
  )
}

export default Footer