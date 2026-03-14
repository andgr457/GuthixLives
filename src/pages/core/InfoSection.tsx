import { useNavigate } from 'react-router-dom'
import '../../styles/InfoSection.css'

interface InfoSectionProps {
  sectionTitle: string
  linkText?: string
  linkUrl?: string
  items: InfoSectionItem[]
  button?: {
    text: string
    onClick: () => void
    className: string
  }
}

interface InfoSectionItem {
  title: string
  titleHint?: string
  value: string
  valueHint?: string
}

export default function InfoSection(props: InfoSectionProps){
  const navigate = useNavigate()

  return <div className='info-section'>
    <div className='info-section-title'>
      {props?.sectionTitle} {(props?.linkText && props?.linkUrl) && <button className='button-link' onClick={() => {navigate(props?.linkUrl ?? '')}}>{props.linkText}</button>}
    </div>
    {props?.button && <button onClick={props?.button?.onClick} className={props?.button?.className}>
      {props?.button?.text} 
    </button>}
    <div className='flex-wrap-gap'>
        {props?.items?.map((item, index) => {
          return <div key={`${item.title}__${index}`} className='info-section-item'>
            <div title={item?.titleHint ?? item?.title} className='info-section-item-title'>
              {item.title}
            </div>
            <div title={item?.valueHint ?? item?.value} className='info-section-item-value'>
              {item.value}
            </div>
          </div>
        })}
      </div>
  </div>
}