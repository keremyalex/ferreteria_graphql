import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function ProtectedLayout() {
    return (
        <div className="flex h-screen">
            <div className="w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <div className="flex-1 overflow-auto p-8">
                <Outlet />
            </div>
        </div>
    );
} 