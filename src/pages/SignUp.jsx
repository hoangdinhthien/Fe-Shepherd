import { Link } from 'react-router-dom';

export default function SignUp() {
  return (
    <div className='p-2 max-w-2xl mx-auto'>
      {/* SIGN IN TITLE*/}
      <h1 className='text-3xl text-center font-semibold my-8'>Sign Up</h1>
      {/* SIGN IN TITLE*/}
      {/*  */}
      {/* SIGN IN FORM */}
      <form className='flex flex-col gap-4'>
        {/* NAME INPUT */}
        <input
          type='name'
          placeholder='Name'
          className='border p-3 rounded-lg'
        />
        {/* NAME INPUT */}
        {/*  */}
        {/* INPUT */}
        <input
          type='email'
          placeholder='Email'
          className='border p-3 rounded-lg'
        />
        {/* INPUT */}
        {/*  */}
        {/* PHONE INPUT */}
        <input
          type='text'
          placeholder='Phone Number'
          className='border p-3 rounded-lg'
        />
        {/* PHONE INPUT */}
        {/*  */}
        {/* PASSWORD INPUT */}
        <input
          type='password'
          placeholder='Password'
          className='border p-3 rounded-lg'
        />
        {/* PASSWORD INPUT */}
        {/*  */}
        {/* SIGN IN BUTTON */}
        <button className='bg-blue-gray-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
          Sign Up
        </button>
        {/* SIGN IN BUTTON */}
        {/*  */}
        {/* SIGN IN WITH GOOGLE BUTTON */}
        <button className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
          Continue with Google
        </button>
        {/* SIGN IN WITH GOOGLE BUTTON */}
      </form>
      {/* SIGN IN FORM */}
      {/*  */}
      {/* -----don't have account and sign up button wrapper----- */}
      <div className='flex gap-2 mt-5'>
        <p>Already have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-blue-700'>Sign In</span>
        </Link>
      </div>
      {/* -----don't have account and sign up button wrapper----- */}
      {/*  */}
      {/* SHOW ERROR */}
      {/* SHOW ERROR */}
    </div>
  );
}
