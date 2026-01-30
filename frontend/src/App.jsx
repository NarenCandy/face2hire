import { useState } from 'react'

import viteLogo from '/vite.svg'
import './App.css'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'

function App() {
 

  return (
    <>
    <h1>Face2Hire </h1>
    <SignedOut>
      <SignInButton mode="modal"/>

    </SignedOut>
    <SignedIn>
      <SignOutButton />
    </SignedIn>
    
    <UserButton />


          
    </>
  )
}

export default App
