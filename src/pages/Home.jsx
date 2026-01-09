
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User"; // Assuming base44 is accessible, either globally or through UserEntity's internal workings, or it's implicitly available.
import { base44 } from "@/api/base44Client";
import { BookOpen, TrendingUp, Users, Star, Award, Brain } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  // Wrap checkUser in useCallback to memoize it and include navigate in its dependencies
  const checkUser = React.useCallback(async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      if (userData) {
        if (!userData.onboarding_completed) {
          // Se não completou onboarding, vai para lá
          navigate(createPageUrl("Onboarding"));
        } else if (userData.user_type) {
          // Se já completou tudo, vai para dashboard
          navigate(createPageUrl("Dashboard"));
        }
      }
    } catch (error) {
      // Usuário não está logado
      setUser(null);
    }
    setLoading(false);
  }, [navigate]); // Add navigate as a dependency

  // Add checkUser to the useEffect dependency array
  React.useEffect(() => {
    checkUser();
  }, [checkUser]); // Now checkUser is a stable dependency

  // Wrap handleUserTypeSelect in useCallback to memoize it and include navigate in its dependencies
  const handleUserTypeSelect = React.useCallback(async (userType) => {
    try {
      // Tenta verificar se já está logado
      // Assuming 'base44' object is available in the scope or imported implicitly.
      // If base44 is not globally available or imported, this line will cause a reference error.
      await base44.auth.me();
      // Se já está logado, vai direto para onboarding.
      // O tipo de usuário será selecionado e persistido na página de Onboarding.
      navigate(createPageUrl("Onboarding"));
    } catch (error) {
      // Se não está logado, faz login com redirect para onboarding.
      // O tipo de usuário será selecionado e persistido na página de Onboarding após o login.
      const callbackUrl = `${window.location.origin}${createPageUrl("Onboarding")}`;
      // Assuming 'base44' object is available in the scope or imported implicitly.
      // If base44 is not globally available or imported, this line will cause a reference error.
      await base44.auth.redirectToLogin(callbackUrl);
    }
  }, [navigate]); // Add navigate as a dependency

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
             style={{
               boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff"
             }}>
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <style>
        {`
          .neumorphic-card {
            background: #e0e0e0;
            box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
            border-radius: 20px;
          }
          .neumorphic-button {
            background: #e0e0e0;
            box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
            border: none;
            border-radius: 15px;
            transition: all 0.3s ease;
          }
          .neumorphic-button:hover {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
            transform: translateY(-2px);
          }
          .neumorphic-button:active {
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            transform: translateY(0);
          }
          .neumorphic-hero {
            background: linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%);
            box-shadow: inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff;
          }
        `}
      </style>

      {/* Hero Section */}
      <div className="neumorphic-hero py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b750ab8e991e96c91baa0b/edc1580f4_ApenasLogo.png" 
              alt="Banco Kids" 
              className="w-24 h-24 mx-auto mb-6"
            />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Banco Kids
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Aprenda inglês e educação financeira de forma gamificada
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="neumorphic-card p-6">
              <BookOpen className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Inglês Prático</h3>
              <p className="text-gray-600">Do iniciante ao avançado com exercícios gamificados</p>
            </div>
            <div className="neumorphic-card p-6">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Educação Financeira</h3>
              <p className="text-gray-600">Simulador de investimentos para aprender na prática</p>
            </div>
            <div className="neumorphic-card p-6">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">IA Assistant</h3>
              <p className="text-gray-600">Tire dúvidas em tempo real com inteligência artificial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Types */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Escolha seu tipo de conta
          </h2>
          
          {user && (
            <div className="text-center mb-8 p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800">
                Olá, <strong>{user.full_name}</strong>! Escolha que tipo de conta você gostaria de usar:
              </p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Estudante */}
            <div className="neumorphic-card p-8 text-center">
              <div className="text-6xl mb-6">👶</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Conta de Estudante</h3>
              <ul className="text-gray-600 mb-8 space-y-2 text-left">
                <li>• Sistema de moedas gamificado</li>
                <li>• Exercícios de inglês personalizados</li>
                <li>• Simulador de investimentos</li>
                <li>• Loja de recompensas físicas</li>
                <li>• IA para tirar dúvidas</li>
              </ul>
              <button
                onClick={() => handleUserTypeSelect("estudante")}
                className="neumorphic-button px-8 py-4 text-lg font-semibold text-gray-800 w-full"
              >
                Começar como Estudante
              </button>
            </div>

            {/* Professor */}
            <div className="neumorphic-card p-8 text-center">
              <div className="text-6xl mb-6">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Conta de Professor</h3>
              <ul className="text-gray-600 mb-8 space-y-2 text-left">
                <li>• Criar exercícios personalizados</li>
                <li>• Banco com +50 tópicos prontos</li>
                <li>• Sistema de correção gamificado</li>
                <li>• Acompanhar progresso dos alunos</li>
                <li>• Definir recompensas em moedas</li>
              </ul>
              <button
                onClick={() => handleUserTypeSelect("professor")}
                className="neumorphic-button px-8 py-4 text-lg font-semibold text-gray-800 w-full"
              >
                Começar como Professor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="py-16 px-6 bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Principais Funcionalidades
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="neumorphic-card p-6 text-center">
              <Star className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Sistema de Moedas</h3>
              <p className="text-gray-600 text-sm">Complete tarefas e ganhe moedas para trocar por recompensas</p>
            </div>
            
            <div className="neumorphic-card p-6 text-center">
              <Award className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Loja de Recompensas</h3>
              <p className="text-gray-600 text-sm">Canecas, cofrinhos, livros e muito mais!</p>
            </div>
            
            <div className="neumorphic-card p-6 text-center">
              <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Simulador Financeiro</h3>
              <p className="text-gray-600 text-sm">Bitcoin, bolsa, FIIs e renda fixa para aprender</p>
            </div>
            
            <div className="neumorphic-card p-6 text-center">
              <Users className="w-10 h-10 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Acompanhamento</h3>
              <p className="text-gray-600 text-sm">Professores acompanham o progresso em tempo real</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
