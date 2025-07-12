//import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../src/component/scss/styles.scss'

//Sign In Form
import SignInForm from './component/signin/SignInForm';
//Sign Up Form
import SignUpForm from './component/signup/SignUpForm';
//Dashboard
import DashboardPage from './component/homepage/dashboard';

//Reset Password
//Main Outlet for Reset Password
import Reset_Pass_Main from './component/pages/account recovery/reset-pass-main';
//Step 1
import Recovery_Email from './component/pages/account recovery/accrec-input/recovery-email';
//Step 2
import Recovery_Message from './component/pages/account recovery/accrec-message/recovery-message';

import Content_Dashboard from './component/pages/content/dash-content/content';
import Dashboard_Form from './component/pages/content/dash-content/contend-for-today/dashboard-form';
import Reflection from './component/pages/content/reflection/reflection';
import DashboardAdmin from './component/admin/dashboardadmin';
import InfoStatus from './component/admin/pages/infointro';
import UserManagement from './component/admin/pages/usermanage/user-management';
import ReflectionManagement from './component/admin/pages/reflectmanage/reflection-management';
import SettingAdmin from './component/admin/settings/settingadmin';
import Viewer_Reflect from './component/admin/pages/reflectmanage/view_reflection/viewer_reflect';
import Acc_Manage from './component/admin/settings/acoount_management/acc_manage';
import Acc_Info from './component/admin/settings/account_info/acc_into';
import CenterMe from './component/pages/content/center-me/centerme.';
import Prayers from './component/pages/content/Prayers/Prayers';
import Rosary from './component/pages/content/rosary/rosary';
import RecordedMass from './component/pages/content/recorded-mass/recordedmass';
import VerseOfTheDay from './component/pages/content/Bible-API/VerseOfTheDay';
import Scriptures from './component/pages/content/Scriptures/Scriptures';
import Deepening from './component/pages/Deepening/Deepening';
import ManageUpload from './component/admin/pages/manageuploads/manage-upload';
import ManageContent from './component/admin/pages/manageuploads/manage-content';
import Profile_User from './component/pages/profile/profile_user';

//import Video_GC from './component/pages/content/God-Centered-Video/video_GC';



const router = createBrowserRouter([
  {
    path: '/',
    element: <SignInForm />,
  },
  {
    path: '/registration',
    element: <SignUpForm />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    children: [
      {
        path: '/dashboard/for-today',
        element: <Content_Dashboard />
      },
      {
        path: '/dashboard/for-today',
        element: <Dashboard_Form />
      },
      {
        path: '/dashboard/reflection',
        element: <Reflection/>
      },
       {
        path: '/dashboard/reflection/center-me',
        element: <CenterMe />
      },
       {
        path: '/dashboard/reflection/Prayers',
        element: < Prayers />
      },
       {
        path: '/dashboard/reflection/Rosary',
        element: < Rosary/>
      },
       {
        path: '/dashboard/recorded-mass/recordedmass',
        element: < RecordedMass/>
      },
         {
        path: '/dashboard/Scriptures',
        element: < Scriptures/>
      },
         {
        path: '/dashboard/Deepening',
        element: < Deepening/>
      },
        {
        path: '/dashboard/profile',
        element: < Profile_User/>
      },
    ]
  },
  {
    path: '/admin-dashboard',
    element: <DashboardAdmin />,
    children: [
      {
        index: true,
        element: <InfoStatus />,
      },
      {
        path: 'user-manager',
        element: <UserManagement />,
      },
      {
        path: 'reflection-manager',
        element: <ReflectionManagement />,
      },
      {
        path: 'reflection-manager/reflection-viewer/:id',
        element: <Viewer_Reflect />,
      },
       {
        path: 'manage-upload',
        element: <ManageUpload />,
      },
       {
        path: 'manage-content',
        element: <ManageContent />,
      },
      {
        path: 'settings',
        element: <SettingAdmin />,
        children: [
          {
            index: true,
            element: <Acc_Info />,
          },
          {
            path: 'account-info',
            element: <Acc_Info />,
          },
          {
            path: 'account-management',
            element: <Acc_Manage />,
          },
        ],
      },
    ]
  },
  {
    path: '/forget-password',
    element: <Reset_Pass_Main />,
    children: [
      {
        path: '/forget-password',
        element: <Recovery_Email />,
      },
      {
        path: '/forget-password/verification-message',
        element: <Recovery_Message />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <div className='app'>
        <RouterProvider router={router} />
      </div>
    </>
  )
}

export default App
