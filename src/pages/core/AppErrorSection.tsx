interface AppErrorSectionProps{
  error: string
}

export default function AppErrorSection(props: AppErrorSectionProps){
  if(!props.error) return null

  return <div className='app-error'>
    {props?.error}
  </div>
}