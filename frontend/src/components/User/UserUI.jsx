import { useState } from "react";
import Home from "./Home";
import Cart from "./Cart";
import OrderPage from "./OrderPage";
import Payment from "./Payment";
import { logoutUser } from "../../services/user";


function UserUI({ onLogout }){
    const [activePage , setActivePage] = useState('home');

    const Pages = {
        home : <Home/>,
        cart : <Cart onCheckout={() => setActivePage('payment')} />,
        payment : (
            <Payment
                onBack={() => setActivePage('cart')}
                onSuccess={() => setActivePage('orderPage')}
            />
        ),
        orderPage : <OrderPage/>,
    };

    const navItems = [
        {key : 'home' , label : 'Home'},
        {key : 'cart' , label : 'Cart'},
        {key : 'orderPage' , label : 'Orders'},
    ];

    const handleLogout = () => {
        logoutUser();
        onLogout();
    };

    return (
        <div className = " min-h-screen bg-slate-100">
            <div className = " border-b border-slate-100 bg-white px-4 py-4 shadow-sm ">
                <div className = " mx-auto flex max-w-6xl items-center justify-between ">
                <div className = " flex flex-wrap gap-3 ">
                {navItems.map((item) => (
                    <button
                    key = {item.key}
                    type = 'button'
                    onClick = {() => setActivePage(item.key)}
                    className = {`rounded-full px-5 py-2 text-sm font-medium transition ${
                        activePage == item.key 
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
                        {item.label}
                    </button>
                ))}
                </div>
                <button
                    onClick={handleLogout}
                    className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                    Logout
                </button>
                </div>
            </div>
            <div>
                {Pages[activePage]}
            </div>
        </div>
    );
}
export default UserUI;