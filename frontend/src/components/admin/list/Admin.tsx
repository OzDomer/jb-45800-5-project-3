import './Admin.css'
import { useNavigate } from 'react-router-dom'
import Vacations from '../../vacations/list/Vacations'

export default function Admin() {

    const navigate = useNavigate()

    return (
        <div className='Admin'>
            <div className='Admin-toolbar'>
                <h2>Vacation Management</h2>
                <button onClick={() => navigate('/admin/add')}>+ Add Vacation</button>
            </div>

            <Vacations adminActions />
        </div>
    )
}