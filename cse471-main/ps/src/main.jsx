import { Children, StrictMode } from 'react'
import { createRoot, ReactDOM } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root from './component/Root/Root.jsx';
import Home from './component/Home/Home.jsx';
import Login from './component/Login/Login.jsx';
import Register from './component/Register/Register.jsx';
import Authprovider from './provider/Authprovider.jsx';
import InvestorDash from './component/Dashboard/UserHome.jsx';
import Investorprofile from './component/Profile/UserProfile.jsx';
import StaffDash from './component/Dashboard/AdminHome.jsx';
import EditUserProfile from './component/Profile/EditUserProfile.jsx';
import InvestorUpdate from './component/Profile/InvestorUpdate.jsx';
import Addpet from './component/Addpet/Addpet.jsx';
import Pets from './component/Addpet/Pets.jsx';
import PetDetails from './component/Addpet/PetDetails.jsx';
import Vaccination from './component/Addpet/Vaccination.jsx';
import VetAppointment from './component/Addpet/VetAppointment.jsx';
import UserHome from './component/Dashboard/UserHome.jsx';
import AdminHome from './component/Dashboard/AdminHome.jsx';
import UserProfile from './component/Profile/UserProfile.jsx';
import EditPetProfile from './component/Edit Pet Profile/editPetProfile.jsx';
import Notification from './component/Notification/Notification.jsx';
import Adoption from './component/Adoption/Adoption.jsx';
import LostOrfound from './component/LostOrFound/LostOrfound.jsx';
import Reviews from './component/Reviews/Reviews'; 
// naimur
import Users from './component/Users/Users.jsx';
import Chat from './component/Chat/Chat.jsx';
import ChatList from './component/Chat/ChatList.jsx';
import AdminReviews from './component/Admin/AdminReviews.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children: [
      { path: "/", element: <Home></Home> },
      { path: "/register", element: <Register></Register> },
      { path: "/login", element: <Login></Login> },
      { path: "/admin-home", element: <AdminHome></AdminHome> },
      { path: "/user-home", element: <UserHome></UserHome> },
      { path: "/userprofile", element: <UserProfile></UserProfile> },
      { path: "/user-edit-profile", element: <EditUserProfile></EditUserProfile> },
      { path: "/investor-update", element: <InvestorUpdate></InvestorUpdate> },
      { path: "/addpet", element: <Addpet></Addpet> },
      { path: "/pets", element: <Pets></Pets> },
      { path: "/pet/:id", element: <PetDetails></PetDetails> },
      { path: "/vaccination", element: <Vaccination /> },
      { path: "/vaccination/:id", element: <Vaccination /> },
      { path: "/vet-appointment", element: <VetAppointment /> },
      { path: "/vet-appointment/:id", element: <VetAppointment /> },
      {
        path: '/edit-pet/:id',
        element: <EditPetProfile />

      },
      {
        path: '/notification',
        element: <Notification></Notification>

      },
      { path: "/adoption", element: <Adoption></Adoption> },
      { path: "/lostorfound", element: <LostOrfound></LostOrfound> },
      { path: "/reviews", element: <Reviews /> }, //rupom
      { path: "/admin/reviews", element: <AdminReviews /> }, // Admin reviews management
      { path: "/users", element: <Users></Users> },
      { path: "/chats", element: <ChatList></ChatList> },
      { path: "/chat/:chatId", element: <Chat></Chat> },
      { path: "/chat/new/:petId", element: <Chat></Chat> },



    ],
  },

]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Authprovider>
      <RouterProvider router={router} />
    </Authprovider>

  </StrictMode>,
)
