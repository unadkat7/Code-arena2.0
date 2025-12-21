import {
  SignedOut,
  SignedIn,
  SignOutButton,
  SignIn,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
function App() {
  return (
    <>
      <h1 className="text-amber-500">Welcome to the app</h1>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Login</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton></UserButton>
    </>
  );
}

export default App;
