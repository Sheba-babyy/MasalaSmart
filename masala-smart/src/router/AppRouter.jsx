import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/signup";
import AdminHome from "../modules/admin/Adminhome";
import StaffHome from "../modules/staff/staffhome";
import ManagerHome from "../modules/manager/managerhome";
import UserSetup from "../modules/admin/UserSetup";
import ManagerProfile from "../modules/manager/ManagerProfile";
import StaffProfile from "../modules/staff/staffprofile";
import DailyProduction from "../modules/staff/DailyProduction";
import AdminProfile from "../modules/admin/AdminProfile";
import ProductionPlanning from "../modules/manager/productionplanning";
import Masala from "../modules/manager/masala";
import BlendPlan from "../modules/manager/blendplan";
import BlendPlans from "../modules/admin/BlendPlan";
import ExpiryAlert from "../modules/admin/ExpiryAlert";
import BOMCreation from "../modules/admin/BOMCreation";
import AdminReports from "../modules/admin/AdminReports";
import AddIngredients from "../modules/admin/Addincredients";
import StaffManagement from "../modules/manager/Staffmanagement";
import ManagerAddIngredients from "../modules/manager/addincredients";
import FinishedGoods from "../modules/staff/FinishedGoods";
import PackingPage from "../modules/staff/PackingPage";
import FeedbackPage from "../modules/staff/FeedbackPage";

import ManagerReports from "../modules/manager/ManagerReports";
import WorkforceManagement from "../modules/manager/WorkforceManagement";
import MyTasks from "../modules/staff/Mytask";
import BatchTracking from "../modules/manager/BatchTrackingPage";
import StaffWorkflow from "../modules/staff/StaffWorkflow";
import ManagerDispatch from "../modules/manager/ManagerDispatch";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Adminhome" element={<AdminHome />} />
        <Route path="/staffhome" element={<StaffHome />} />
        <Route path="/managerhome" element={<ManagerHome />} />
        <Route path="/admin/UserSetup" element={<UserSetup />} />
        <Route path="/manager/profile" element={<ManagerProfile />} />
        <Route path ="/manager/Staffmanagement" element={<StaffManagement />}/>
        <Route path="/manager/addincredients" element={<ManagerAddIngredients/>}/>
        <Route path="/staff/profile" element={<StaffProfile />} />
        <Route path="/staff/FinishedGoods" element={<FinishedGoods />}   />  
        <Route path="/staff/PackingPage" element={<PackingPage/>} />
        <Route path="/staff/FeedbackPage" element={<FeedbackPage/>} />
        <Route path="/staff/production" element={<DailyProduction />} />
        
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/manager/productionplanning" element={<ProductionPlanning />} />
        <Route path="/manager/reports" element={<ManagerReports/>} />
        <Route path="/manager/masala" element={<Masala />} />
        <Route path="/manager/blendplan" element={<BlendPlan />} />
        <Route path="/admin/BlendPlan" element={<BlendPlans />} />
        <Route path="/manager/WorkforceManagement" element={<WorkforceManagement/>}/>
        <Route path="manager/BatchTrackingPage" element={<BatchTracking />} />
        <Route path="/staff/tasks" element={<MyTasks/>} />
        <Route path="/staff/StaffWorkflow" element={<StaffWorkflow />}/>
        <Route path="/staff/ManagerDispatch" element={<ManagerDispatch />}/>
        <Route path="/admin/ExpiryAlert" element={<ExpiryAlert />} />
        <Route path="/admin/BOMCreation" element={<BOMCreation />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/Addincredients" element={<AddIngredients />} />
        



      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
