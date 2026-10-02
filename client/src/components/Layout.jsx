jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import TransactionModal from './TransactionModal';
import BudgetModal from './BudgetModal';
import GoalModal from './GoalModal';
import { useUI } from '../context/UIContext';

export default function Layout() {
  const { modal, closeModal } = useUI();
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Navbar />
        <main className="mx-auto max-w-7xl p-4 pb-28 md:p-8 md:pb-10"><Outlet /></main>
      </div>
      <BottomNav />
      {modal?.type === 'transaction' && <TransactionModal data={modal.data} onClose={closeModal} />}
      {modal?.type === 'budget' && <BudgetModal data={modal.data} onClose={closeModal} />}
      {modal?.type === 'goal' && <GoalModal data={modal.data} onClose={closeModal} />}
    </div>
  );
}
