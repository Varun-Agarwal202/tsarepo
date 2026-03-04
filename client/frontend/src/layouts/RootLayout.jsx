import React, { useContext } from 'react'
import Navbar from '../components/Navbar';
import NavbarLoggedIn from '../components/NavbarLoggedIn';
import { AuthContext } from '../context/AuthContext';
import NavbarBusiness from '../components/NavbarBusiness';
import AccessibilityToolbar from '../components/AccessibilityToolbar';

const RootLayout = () => {
    const { isAuthenticated, role } = useContext(AuthContext);
    // show business navbar for business role, logged-in navbar for normal users
    if (isAuthenticated && role === 'business') {
      return (
        <>
          <NavbarBusiness />
          <AccessibilityToolbar />
        </>
      )
    }
    return (
      <div>
        {isAuthenticated ? <NavbarLoggedIn /> : <Navbar />}
        <AccessibilityToolbar />
      </div>
    )
}

export default RootLayout