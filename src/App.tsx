/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { HowItWorks } from './components/HowItWorks';
import { FeaturesSection } from './components/FeaturesSection';
import { ImpactDashboard } from './components/ImpactDashboard';
import { ImpactSection } from './components/ImpactSection';
import { StoriesSection } from './components/StoriesSection';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { DonationModal } from './components/modals/DonationModal';
import { VolunteerModal } from './components/modals/VolunteerModal';
import { PartnershipModal } from './components/modals/PartnershipModal';
import { AuthModal } from './components/modals/AuthModal';
import { DatabaseStatusModal } from './components/modals/DatabaseStatusModal';
import { RoleSelectScreen } from './components/auth/RoleSelectScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { DonorDashboard } from './components/dashboard/DonorDashboard';
import { NgoDashboard } from './components/dashboard/NgoDashboard';
import { VolunteerDashboard } from './components/dashboard/VolunteerDashboard';
import { foodbridgeService } from './services/foodbridgeService';
import {
  ModalType,
  UserSession,
  UserProfile,
  UserRole,
  ViewRoute,
  DonationSubmission,
  VolunteerSubmission,
  PartnerSubmission,
} from './types';
import { HeartHandshake, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return foodbridgeService.getCurrentSession();
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>('landing');
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  // Dark mode theme state with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foodbridge_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Keep <html> element in sync with theme state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('foodbridge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('foodbridge_theme', 'light');
    }
  }, [isDarkMode]);

  const showToast = useCallback((text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Safe navigation handler that manages state and window history / hash
  const navigateTo = useCallback(
    (route: ViewRoute, role?: UserRole) => {
      if (role) {
        setSelectedRole(role);
      }
      setCurrentRoute(route);

      let hash = '#home';
      switch (route) {
        case 'role-select':
          hash = '#/role-select';
          break;
        case 'auth':
          hash = '#/auth';
          break;
        case 'donor-dashboard':
          hash = '#/donor/dashboard';
          break;
        case 'ngo-dashboard':
          hash = '#/ngo/dashboard';
          break;
        case 'volunteer-dashboard':
          hash = '#/volunteer/dashboard';
          break;
        default:
          hash = '#home';
          break;
      }

      try {
        if (window.location.hash !== hash) {
          window.history.pushState(null, '', hash);
        }
      } catch {
        // Fallback for sandboxed frames
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  // Synchronize route with initial URL hash or path and handle popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash.includes('/donor/dashboard') || path.includes('/donor/dashboard')) {
        const user = foodbridgeService.getCurrentSession();
        if (user && user.role === 'donor') {
          setCurrentUser(user);
          setCurrentRoute('donor-dashboard');
        } else if (user) {
          showToast(`Access Restricted: Redirected to your authorized ${user.role.toUpperCase()} dashboard.`, true);
          navigateTo(`${user.role}-dashboard` as ViewRoute);
        } else {
          setSelectedRole('donor');
          setCurrentRoute('auth');
        }
      } else if (hash.includes('/ngo/dashboard') || path.includes('/ngo/dashboard')) {
        const user = foodbridgeService.getCurrentSession();
        if (user && user.role === 'ngo') {
          setCurrentUser(user);
          setCurrentRoute('ngo-dashboard');
        } else if (user) {
          showToast(`Access Restricted: Redirected to your authorized ${user.role.toUpperCase()} dashboard.`, true);
          navigateTo(`${user.role}-dashboard` as ViewRoute);
        } else {
          setSelectedRole('ngo');
          setCurrentRoute('auth');
        }
      } else if (hash.includes('/volunteer/dashboard') || path.includes('/volunteer/dashboard')) {
        const user = foodbridgeService.getCurrentSession();
        if (user && user.role === 'volunteer') {
          setCurrentUser(user);
          setCurrentRoute('volunteer-dashboard');
        } else if (user) {
          showToast(`Access Restricted: Redirected to your authorized ${user.role.toUpperCase()} dashboard.`, true);
          navigateTo(`${user.role}-dashboard` as ViewRoute);
        } else {
          setSelectedRole('volunteer');
          setCurrentRoute('auth');
        }
      } else if (hash.includes('/role-select') || hash.includes('/roles')) {
        setCurrentRoute('role-select');
      } else if (hash.includes('/auth') || hash.includes('/login')) {
        setCurrentRoute('role-select');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [navigateTo, showToast]);

  // Monitor scroll for floating quick donate CTA button on landing page
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    navigateTo('auth', role);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.fullName}! Entering ${user.role.toUpperCase()} Portal.`);

    if (user.role === 'donor') {
      navigateTo('donor-dashboard');
    } else if (user.role === 'ngo') {
      navigateTo('ngo-dashboard');
    } else if (user.role === 'volunteer') {
      navigateTo('volunteer-dashboard');
    } else {
      navigateTo('landing');
    }
  };

  const handleLogout = () => {
    foodbridgeService.setCurrentSession(null);
    setCurrentUser(null);
    showToast('Signed out of FoodBridge portal.');
    navigateTo('landing');
  };

  const handleDonationSubmitted = (donation: DonationSubmission) => {
    showToast(`Surplus Batch #${donation.id} recorded! Dispatched to local rescue network.`);
  };

  const handleVolunteerSubmitted = (volunteer: VolunteerSubmission) => {
    showToast(`Welcome ${volunteer.fullName}! Volunteer profile #${volunteer.id} created.`);
  };

  const handlePartnerSubmitted = (partner: PartnerSubmission) => {
    showToast(`Application #${partner.id} for ${partner.orgName} received for accreditation.`);
  };

  const handleExploreMission = () => {
    document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Convert current UserProfile into Navbar's UserSession
  const userSession: UserSession | null = currentUser
    ? {
        isLoggedIn: true,
        user: currentUser,
        name: currentUser.fullName,
        role: currentUser.role,
        organization: currentUser.organizationName,
      }
    : null;

  // Render Role Selection Screen
  if (currentRoute === 'role-select') {
    return (
      <div className="min-h-screen bg-[#F8F5EB] dark:bg-[#0E1611] text-[#202820] dark:text-[#F4F6F4]">
        {toastMessage && (
          <div className="fixed top-6 right-4 sm:right-8 z-50 max-w-md bg-[#123D2B] dark:bg-[#142318] text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
            <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <RoleSelectScreen
          onSelectRole={handleRoleSelect}
          onBackToWebsite={() => navigateTo('landing')}
        />
      </div>
    );
  }

  // Render Authentication Screen
  if (currentRoute === 'auth') {
    return (
      <div className="min-h-screen bg-[#F8F5EB] dark:bg-[#0E1611] text-[#202820] dark:text-[#F4F6F4]">
        {toastMessage && (
          <div className="fixed top-6 right-4 sm:right-8 z-50 max-w-md bg-[#123D2B] dark:bg-[#142318] text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
            <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <AuthScreen
          selectedRole={selectedRole}
          onSuccess={handleAuthSuccess}
          onBackToRoles={() => navigateTo('role-select')}
        />
      </div>
    );
  }

  // Render Donor Dashboard (/donor/dashboard)
  if (currentRoute === 'donor-dashboard') {
    if (!currentUser) {
      return (
        <AuthScreen
          selectedRole="donor"
          onSuccess={handleAuthSuccess}
          onBackToRoles={() => navigateTo('role-select')}
        />
      );
    }
    return (
      <DonorDashboard
        user={currentUser}
        onLogout={handleLogout}
        onViewWebsite={() => navigateTo('landing')}
      />
    );
  }

  // Render NGO Partner Dashboard (/ngo/dashboard)
  if (currentRoute === 'ngo-dashboard') {
    if (!currentUser) {
      return (
        <AuthScreen
          selectedRole="ngo"
          onSuccess={handleAuthSuccess}
          onBackToRoles={() => navigateTo('role-select')}
        />
      );
    }
    return (
      <NgoDashboard
        user={currentUser}
        onLogout={handleLogout}
        onViewWebsite={() => navigateTo('landing')}
      />
    );
  }

  // Render Volunteer Dashboard (/volunteer/dashboard)
  if (currentRoute === 'volunteer-dashboard') {
    if (!currentUser) {
      return (
        <AuthScreen
          selectedRole="volunteer"
          onSuccess={handleAuthSuccess}
          onBackToRoles={() => navigateTo('role-select')}
        />
      );
    }
    return (
      <VolunteerDashboard
        user={currentUser}
        onLogout={handleLogout}
        onViewWebsite={() => navigateTo('landing')}
      />
    );
  }

  // Default: Public Landing Page
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EB] dark:bg-[#0E1611] text-[#202820] dark:text-[#F4F6F4] selection:bg-[#3C8D58]/20 selection:text-[#123D2B] dark:selection:text-[#F4A259] transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 sm:right-8 z-50 max-w-md ${
            toastMessage.isError ? 'bg-red-800' : 'bg-[#123D2B] dark:bg-[#142318]'
          } text-white p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {toastMessage.isError ? (
              <AlertTriangle className="w-5 h-5 text-red-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#3C8D58] dark:text-[#4EBE73] shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sticky Navigation Bar with Role Authentication Flow & Theme Toggle */}
      <Navbar
        onOpenDonate={() => {
          if (currentUser && currentUser.role === 'donor') {
            navigateTo('donor-dashboard');
          } else {
            setActiveModal('donate');
          }
        }}
        onOpenLogin={() => navigateTo('role-select')}
        onGoToDashboard={() => {
          if (currentUser) {
            navigateTo(`${currentUser.role}-dashboard` as ViewRoute);
          } else {
            navigateTo('role-select');
          }
        }}
        userSession={userSession}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenDbStatus={() => setIsDbModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <HeroSection
          onOpenDonate={() => {
            if (currentUser && currentUser.role === 'donor') {
              navigateTo('donor-dashboard');
            } else {
              navigateTo('role-select');
            }
          }}
          onExploreMission={handleExploreMission}
        />

        <ProblemSection onOpenDonate={() => setActiveModal('donate')} />

        <SolutionSection
          onOpenDonate={() => {
            if (currentUser && currentUser.role === 'donor') {
              navigateTo('donor-dashboard');
            } else {
              navigateTo('role-select');
            }
          }}
          onOpenPartner={() => {
            setSelectedRole('ngo');
            navigateTo('auth', 'ngo');
          }}
        />

        <HowItWorks
          onOpenDonate={() => {
            if (currentUser && currentUser.role === 'donor') {
              navigateTo('donor-dashboard');
            } else {
              navigateTo('role-select');
            }
          }}
        />

        <FeaturesSection
          onOpenDonate={() => {
            if (currentUser && currentUser.role === 'donor') {
              navigateTo('donor-dashboard');
            } else {
              navigateTo('role-select');
            }
          }}
          onOpenPartner={() => {
            setSelectedRole('ngo');
            navigateTo('auth', 'ngo');
          }}
          onOpenVolunteer={() => {
            setSelectedRole('volunteer');
            navigateTo('auth', 'volunteer');
          }}
        />

        <ImpactDashboard
          onOpenDonate={() => {
            if (currentUser && currentUser.role === 'donor') {
              navigateTo('donor-dashboard');
            } else {
              navigateTo('role-select');
            }
          }}
        />

        <ImpactSection
          onOpenDonate={() => {
            if (currentUser && currentUser.role === 'donor') {
              navigateTo('donor-dashboard');
            } else {
              navigateTo('role-select');
            }
          }}
        />

        <StoriesSection />

        <CallToAction
          onOpenDonate={() => {
            if (currentUser && currentUser.role === 'donor') {
              navigateTo('donor-dashboard');
            } else {
              navigateTo('role-select');
            }
          }}
          onOpenVolunteer={() => {
            setSelectedRole('volunteer');
            navigateTo('auth', 'volunteer');
          }}
          onOpenPartner={() => {
            setSelectedRole('ngo');
            navigateTo('auth', 'ngo');
          }}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenDonate={() => {
          if (currentUser && currentUser.role === 'donor') {
            navigateTo('donor-dashboard');
          } else {
            navigateTo('role-select');
          }
        }}
        onOpenVolunteer={() => {
          setSelectedRole('volunteer');
          navigateTo('auth', 'volunteer');
        }}
        onOpenPartner={() => {
          setSelectedRole('ngo');
          navigateTo('auth', 'ngo');
        }}
        onOpenDbStatus={() => setIsDbModalOpen(true)}
      />

      {/* Floating Fast Action Donate Button (Appears on scroll) */}
      {showFloatingCTA && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-from-bottom-3 duration-300">
          <button
            onClick={() => {
              if (currentUser && currentUser.role === 'donor') {
                navigateTo('donor-dashboard');
              } else {
                setActiveModal('donate');
              }
            }}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F4A259] to-[#E89143] hover:from-[#E89143] hover:to-[#D47D30] text-[#123D2B] font-bold text-xs sm:text-sm shadow-[0_8px_25px_rgba(244,162,89,0.45)] dark:shadow-[0_8px_30px_rgba(244,162,89,0.35)] flex items-center gap-2.5 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-[#123D2B]" />
            <span>Donate Surplus</span>
          </button>
        </div>
      )}

      {/* Modals for instant actions */}
      <DonationModal
        isOpen={activeModal === 'donate'}
        onClose={() => setActiveModal(null)}
        onDonationSubmitted={handleDonationSubmitted}
      />

      <VolunteerModal
        isOpen={activeModal === 'volunteer'}
        onClose={() => setActiveModal(null)}
        onVolunteerSubmitted={handleVolunteerSubmitted}
      />

      <PartnershipModal
        isOpen={activeModal === 'partner'}
        onClose={() => setActiveModal(null)}
        onPartnerSubmitted={handlePartnerSubmitted}
      />

      <AuthModal
        isOpen={activeModal === 'login'}
        onClose={() => setActiveModal(null)}
        onLogin={(session) => {
          if (session.user) {
            handleAuthSuccess(session.user);
          } else {
            showToast(`Signed in as ${session.name || 'Member'}`);
          }
        }}
      />

      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </div>
  );
}
