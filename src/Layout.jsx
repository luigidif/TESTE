
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Home,
  BookOpen,
  Gift,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Users,
  Trophy
} from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      // Ensure user is null if there's an error, meaning no authenticated user
      setUser(null); 
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    // Redirect to login or home page after logout
    window.location.href = createPageUrl("Login"); // Assuming a 'Login' page exists
  };

  const goToDashboard = () => {
    window.location.href = createPageUrl("Dashboard");
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const commonItems = [
      { name: "Dashboard", icon: Home, url: createPageUrl("Dashboard") }
    ];

    if (user.user_type === "estudante") {
      return [
        ...commonItems,
        { name: "Quizzes", icon: BookOpen, url: createPageUrl("MiniGame") },
        { name: "Investimentos", icon: TrendingUp, url: createPageUrl("Investments") },
        { name: "Minhas Tarefas", icon: BookOpen, url: createPageUrl("StudentTasks") },
        { name: "Loja de Recompensas", icon: Gift, url: createPageUrl("RewardStore") },
        { name: "Ranking", icon: Trophy, url: createPageUrl("Ranking") }
      ];
    }

    if (user.user_type === "professor") {
      return [
        ...commonItems,
        { name: "Criar Tarefa", icon: BookOpen, url: createPageUrl("CreateTask") },
        { name: "Avaliar Tarefas", icon: GraduationCap, url: createPageUrl("GradeTasks") },
        { name: "Banco de Exercícios", icon: BookOpen, url: createPageUrl("ExerciseBank") },
        { name: "Alunos", icon: Users, url: createPageUrl("StudentsList") },
        { name: "Ranking", icon: Trophy, url: createPageUrl("Ranking") }
      ];
    }

    if (user.user_type === "responsavel") {
      return [
        ...commonItems,
        { name: "Ranking", icon: Trophy, url: createPageUrl("Ranking") }
      ];
    }

    return commonItems;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" translate="no">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
             style={{
               boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff"
             }}>
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // If not loading and no user, render children directly (e.g., login page, public content)
  if (!user) {
    return <div translate="no">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden" translate="no">
      <style>
        {`
          .neumorphic-card {
            background: #e0e0e0;
            box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
            border-radius: 20px;
          }
          .neumorphic-pressed {
            background: #e0e0e0;
            box-shadow: inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff;
            border-radius: 20px;
          }
          .neumorphic-button {
            background: #e0e0e0;
            box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
            border: none;
            border-radius: 15px;
            transition: all 0.2s ease;
          }
          .neumorphic-button:hover {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
          }
          .neumorphic-button:active {
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
          }
          
          @media (max-width: 1023px) {
            .neumorphic-card-mobile {
              background: #e0e0e0;
              box-shadow: 3px 3px 6px #bebebe, -3px -3px 6px #ffffff;
              border-radius: 15px;
            }
            .neumorphic-pressed-mobile {
              background: #e0e0e0;
              box-shadow: inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff;
              border-radius: 15px;
            }
            .neumorphic-button-mobile {
              background: #e0e0e0;
            box-shadow: 2px 2px 4px #bebebe, -2px -2px 4px #ffffff;
              border: none;
              border-radius: 12px;
              transition: all 0.2s ease;
            }
            .neumorphic-button-mobile:active {
              box-shadow: inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff;
            }
          }
        `}
      </style>

      <div className="lg:hidden">
        <div className="neumorphic-card-mobile m-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={goToDashboard}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b750ab8e991e96c91baa0b/edc1580f4_ApenasLogo.png"
                  alt="Banco Kids"
                  className="w-10 h-10 cursor-pointer"
                />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-800 truncate">Banco Kids</h1>
                <p className="text-sm text-gray-600 capitalize truncate">{user.user_type}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="neumorphic-button-mobile p-3 flex-shrink-0"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-hidden">
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-80
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full p-6">
            <div className="neumorphic-card p-6 mb-6 hidden lg:block">
              <button
                onClick={goToDashboard}
                className="flex items-center gap-4 mb-6 w-full hover:opacity-70 transition-opacity"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b750ab8e991e96c91baa0b/edc1580f4_ApenasLogo.png"
                  alt="Banco Kids"
                  className="w-12 h-12 cursor-pointer"
                />
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-800">Banco Kids</h1>
                  <p className="text-gray-600 capitalize">{user.user_type}</p>
                </div>
              </button>

              <div className="neumorphic-pressed p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Perfil"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{user.full_name || "Usuário"}</p>
                    {user.user_type === "estudante" && (
                      <p className="text-orange-500 font-bold">
                        🪙 {(user.coins_balance || 0).toFixed(2)} coins
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="neumorphic-card-mobile lg:neumorphic-card p-4 mb-6">
              <nav className="space-y-2">
                {getNavigationItems().map((item) => (
                  <Link
                    key={item.name}
                    to={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                      ${location.pathname === item.url
                        ? 'neumorphic-pressed-mobile lg:neumorphic-pressed text-orange-600'
                        : 'hover:bg-gray-200 text-gray-700'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="neumorphic-card-mobile lg:neumorphic-card p-4">
              <Link
                to={createPageUrl("Profile")}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-200 text-gray-700 transition-all duration-200 mb-2"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-100 text-red-600 transition-all duration-200 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 lg:ml-0 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
