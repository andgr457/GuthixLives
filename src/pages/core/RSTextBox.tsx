import type { RSTextBoxProps } from '../../interfaces/core/RSTextBox'
import AppErrorSection from './AppErrorSection'
import '../../styles/RSTextBox.css'

export default function RSTextBox(props: RSTextBoxProps){
  return <div className='rstextbox'>
    <div className='rstextbox-title'>
      {props?.label.value}
    </div>
    <div className='input-row-item'>
      <input 
        onChange={props?.textbox?.onChange} 
        type='text'
        placeholder={props?.textbox?.placehoder}
      />
      {props?.button && <button 
        type={props?.button?.type}
        className={props?.button?.className}
        onClick={props?.button?.onClick}
      >
        {props?.button?.text}
      </button>}
    </div>
    {props?.showError ?? true === true ? 
    
      <div className='rstextbox-error'>
        <AppErrorSection error={props?.errorMessage as string} /> 
      </div>
    
    : null}
  </div>
}