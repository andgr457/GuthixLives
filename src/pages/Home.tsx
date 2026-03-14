import useScrollReveal from '../hooks/useScrollReveal'

export default function Home() {
  useScrollReveal()
  return <div>
    <div className='app-title'>
      Welcome
    </div>
    <div className='basic-list reveal'>
      <div className='basic-div reveal'>
        Guthix Lives is a <strong>RuneScape 3</strong> social community that has been
        going strong for over 13 years.
      </div>
      <div className='app-logo '>
          <img src='img/guthix.svg'></img>
      </div>
      <div className='reveal'>
        <div className='basic-div'>
          Founded on <strong>September 24, 2013</strong>, our clan focuses on helping new and
          returning players with support, encouragement, and advice — whether
          that's exploring new content, training more efficiently, earning more
          GP, or simply having more fun.
        </div>
        <div className='basic-div'>
          We're also home to experienced players who enjoy sharing their
          knowledge and helping others progress. With members from all around the
          world, Guthix Lives is a welcoming and supportive community for
          everyone.
        </div>
      </div>
      

    </div>
  </div>
}