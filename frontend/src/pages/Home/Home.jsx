
import { useState } from 'react'
import './Home.css'
import ExploreMenu from '../../components/ExploreMenu/Exploremenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import Header from '../../components/Header/Header'


const Home = () => {
  const [category, setCategory] = useState("All");
  
  return (
    <div className='home'>
        <Header/>
      
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
      <AppDownload/>
      
    </div>

  )
}

export default Home