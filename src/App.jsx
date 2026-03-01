import { Route, Routes } from 'react-router-dom'
import LandingPage from './Home/LandingPage'
import Error from './UI/Error'
import SignIn from './Pages/SignIn'
import BuyerDashboard from './Pages/BuyerDashboard'
import AdminSignIn from './Pages/AdminSignIn'
import Cart from './Pages/Cart'
import Wishlist from './Pages/Wishlist'
import BuyerProfileDetails from './Pages/BuyerProfileDetails'
import CategoryShop from './Pages/CategoryShop'
import Shop from './Pages/Shop'
import Payment from './Pages/Payment'
import Contact from './Pages/Contact'
import AdminDashboard from './Pages/AdminDashboard'
import BuyerOrder from './Pages/BuyerOrder'
import AdminProducts from './Pages/AdminProducts'
import AdminMessages from './Pages/AdminMessages'
import AdminOrders from './Pages/AdminOrders'
import AdminSettings from './Pages/AdminSettings'
import UserContact from './Pages/UserContact'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
      <Route path="/admin-signin" element={<AdminSignIn />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-products" element={<AdminProducts />} />
      <Route path="/admin-messages" element={<AdminMessages />} />
      <Route path="/admin-orders" element={<AdminOrders />} />
      <Route path="/admin-settings" element={<AdminSettings />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/buyer-profile" element={<BuyerProfileDetails />} />
      <Route path="/shop/:categorySlug/:subcategorySlug" element={<CategoryShop />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/orders" element={<BuyerOrder />} />
      <Route path="/messages" element={<UserContact />} />
      <Route path="/user-contact" element={<UserContact />} />
      <Route path="/contact" element={<Contact />} />

      <Route path='*' element={<Error/>}/>
    </Routes>
  )
}
