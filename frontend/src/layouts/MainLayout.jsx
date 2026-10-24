import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function MainLayout({ children, onOpenEnquiry }) {
  return (
    <div className="app-wrapper">
      <Header onOpenEnquiry={onOpenEnquiry} />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
