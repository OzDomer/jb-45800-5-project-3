import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Provider as Redux } from 'react-redux'
import store from '../../redux/store'
import Auth from '../auth/auth/Auth'
import Layout from '../layout/layout/Layout'

function App() {

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Redux store={store}>
          <Auth>
            <Layout />
          </Auth>
        </Redux>
      </BrowserRouter>
    </>
  )
}

export default App
