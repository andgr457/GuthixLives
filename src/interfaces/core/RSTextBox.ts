export interface RSTextBoxProps {
  showError: boolean
  errorMessage?: string
  label: {
    value: string
  }
  textbox: {
    placehoder: string
    id: string
    key: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  }
  button?: {
    type: "button" | "reset" | "submit" | undefined
    text: string
    className: 'primary' | 'danger'
    onClick: (e: React.SyntheticEvent) => void
  }
}