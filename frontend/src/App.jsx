import Auth from "./components/auth/Auth";
import { getCurrentUser } from "./services/user";
import api from "./services/api";
import { useState , useEffect } from "react";
import AdminUI from "./components/Admin/AdminUI";
import UserUI from "./components/User/UserUI";
import {BrowserRouter , Routes , Route , Navigate } from "react-router-dom";

function App(){
    const [isLoggedIn , setIsLoggedIn] = useState(
        !!localStorage.getItem('token')
    );
    const user = getCurrentUser();
    
    const handleLogout = () => {
        setIsLoggedIn(false);
    };
    
    if(!isLoggedIn){
        return <Auth onAuth = {() => setIsLoggedIn(true)} />;
    }

    return (
        <BrowserRouter>
        <Routes>
            {user?.userRole === "admin" ? (
                <Route path = "/*" element = {<AdminUI onLogout={handleLogout}/>}/> ) :
                (<Route path = "/*" element = {<UserUI onLogout={handleLogout}/>}/>
            )}
            <Route path = "*" element = {<Navigate to = "/" replace />}/>
        </Routes>
        </BrowserRouter>
    );
    
}
export default App;