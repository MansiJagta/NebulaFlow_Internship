import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ParticleBackground from './ParticleBackground';
import { Outlet } from 'react-router-dom';
import PageTransition from './PageTransition';
import { useState } from 'react';

const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex">
            <ParticleBackground />
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
                <Navbar />
                <main className="flex-1 p-6 overflow-auto">
                    <PageTransition>
                        <Outlet />
                    </PageTransition>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
