import React from 'react'
import Hero from './Components/Hero'
import Features from "./Components/Features";
import GithubPreview from './Components/GithubPreview';
import Footer from './Components/Footer';
import Navbar from "./Components/Navbar";

const Home = () => {
  return (
    <div>
        <Navbar/>
      <Hero/>
      <Features/>
      <GithubPreview/>
      <Footer/>
    </div>
  )
}

export default Home
