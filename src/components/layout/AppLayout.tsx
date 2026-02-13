import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ParticleBackground from './ParticleBackground';
import { Outlet } from 'react-router-dom';
import PageTransition from './PageTransition';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex">
      <ParticleBackground />
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col relative z-10">
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
