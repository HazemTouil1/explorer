import React from 'react'
import Hero from '../components/Hero'
import StatsSection from '../components/StatsSection'
import LatestBlocks from '../components/LatestBlocks'
import LatestTransactions from '../components/LatestTransactions'

const Home = () => {
  return (
    <>
      <Hero />
      <main className="flex-1 -mt-20 relative z-10 w-full">
        <div className="container max-w-7xl mx-auto px-4 w-full">
          <StatsSection />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-12">
            <LatestBlocks />
            <LatestTransactions />
          </div>
        </div>
      </main>
    </>
  )
}

export default Home

