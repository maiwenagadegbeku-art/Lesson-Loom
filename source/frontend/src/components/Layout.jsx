import React from 'react';
import Header from './Header';
import { useApp } from '../contexts/AppContext';
import SequenceurView from '../views/SequenceurView';
import SeancesView from '../views/SeancesView';
import ProgressionView from '../views/ProgressionView';
import CalendrierView from '../views/CalendrierView';
import EvaluationsView from '../views/EvaluationsView';
import SearchView from '../views/SearchView';
import Footer from './Footer';
import ImportSharedSequenceModal from './ImportSharedSequenceModal';

const Layout = () => {
  const { activeView } = useApp();
  return (
    <div className="app-shell">
      <Header />
      {activeView === 'seq' && <SequenceurView />}
      {activeView === 'sea' && <SeancesView />}
      {activeView === 'prog' && <ProgressionView />}
      {activeView === 'cal' && <CalendrierView />}
      {activeView === 'eval' && <EvaluationsView />}
      {activeView === 'search' && <SearchView />}
      <ImportSharedSequenceModal />
      <Footer />
    </div>
  );
};

export default Layout;
