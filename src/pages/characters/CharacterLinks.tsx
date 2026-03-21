import { useNavigate } from 'react-router-dom'

interface CharacterLinksProps {
  page: 'items' | 'orders'
  characterId: string
}

export default function CharacterLinks(props: CharacterLinksProps) {
  const navigate = useNavigate()

  const bright = {filter: 'brightness(1.5)'}
  const normal = {filter: 'brightness(1)'}

  return <div style={{textAlign: 'center'}}>

    <button 
      className='button-link' 
      style={
        normal
      }
      onClick={() => {navigate('/characters')}}
    >
      Characters
    </button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <button 
      className='button-link' 
      style={
        props.page === 'items' ? bright : normal
      }
      onClick={() => {navigate(`/characters/${props.characterId}/ge-items`)}}
    >
      Items
    </button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <button 
      className='button-link'
      style={
        props.page === 'orders' ? bright : normal
      }
      onClick={() => {navigate(`/characters/${props.characterId}/ge-orders`)}}
    >
      Orders
    </button>
  </div>
}