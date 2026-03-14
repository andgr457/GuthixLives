import { withPreventDefault } from '../../core/CommonHelpers'
import type { RSTextBoxProps } from '../../interfaces/core/RSTextBox'
import RSTextBox from './RSTextBox'

interface RSTextBoxAsFormProps {
  onSubmit: () => void
  rsTextBoxProps: RSTextBoxProps
}

export default function RSTextBoxAsForm(props: RSTextBoxAsFormProps){
  return <form onSubmit={withPreventDefault(props.onSubmit)}>
      <RSTextBox 
        {...props.rsTextBoxProps}
      />
    </form>
}