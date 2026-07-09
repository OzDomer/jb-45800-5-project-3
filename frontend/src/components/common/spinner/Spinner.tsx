import './Spinner.css'
import spinnerSrc from '../../../assets/spinner.gif'

export default function Spinner() {
    return (
        <div className='Spinner'>
            <img src={spinnerSrc} alt='loading...' />
        </div>
    )
}