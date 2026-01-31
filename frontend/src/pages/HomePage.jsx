import { SignInButton, SignedOut, SignOutButton, SignedIn, UserButton } from '@clerk/clerk-react'
import React from 'react'

function HomePage() {
  return (
    <div>


        <SignedOut>
            <SignInButton mode="modal">
                <button className='btn btn-primary' >Login</button>
            </SignInButton>
        </SignedOut>

        <SignedIn>
            <SignOutButton/>
        </SignedIn>

        <UserButton/>
    </div>
  )
}

export default HomePage



