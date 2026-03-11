import '../styles/Home.css'
export default function Home() {
  return <div>
    <div className='home-clan-name'>
      Guthix Lives
    </div>
    <div className='parchment-list'>
      <div className='parchment'>
        We're a <strong>RuneScape 3</strong> social community that has been
        going strong for over 13 years.
      </div>
      <div className='parchment'>
        Founded on <strong>September 24, 2013</strong>, our clan focuses on helping new and
        returning players with support, encouragement, and advice — whether
        that's exploring new content, training more efficiently, earning more
        GP, or simply having more fun.
      </div>
      <div className='parchment'>
        We're also home to experienced players who enjoy sharing their
        knowledge and helping others progress. With members from all around the
        world, Guthix Lives is a welcoming and supportive community for
        everyone.
      </div>
      <div className='parchment' style={{textAlign: 'center'}}>
          <img style={{height: '40vh'}} src='img/guthix.svg'></img>
      </div>

    </div>
  </div>
}