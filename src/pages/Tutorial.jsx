
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User";
import { 
  ArrowRight, ArrowLeft, Home, Flame, Gamepad2, 
  BookOpen, Trophy, TrendingUp, Sparkles, DollarSign, 
  Award, Target, CheckCircle
} from "lucide-react";

export default function Tutorial() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      if (!userData.onboarding_completed) {
        navigate(createPageUrl("Onboarding"));
        return;
      }
      
      if (userData.tutorial_completed) {
        navigate(createPageUrl("Dashboard"));
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  };

  const studentSteps = [
    {
      icon: Home,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "Bem-vindo ao Banco Kids! 🎉",
      description: "Vamos conhecer todos os recursos da plataforma!",
      points: [
        "📚 Aprenda inglês de forma divertida",
        "💰 Ganhe moedas completando atividades",
        "📈 Invista e aprenda educação financeira",
        "🏆 Compete com seus colegas",
        "🎁 Troque moedas por prêmios reais"
      ]
    },
    {
      icon: Home,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "Dashboard - Seu Painel Principal 🏠",
      description: "O Dashboard é onde você vê tudo que está acontecendo:",
      points: [
        "💰 Quantas moedas você tem disponíveis",
        "📊 Quanto de imposto você precisa pagar (R$ 300/mês)",
        "📝 Quais atividades você tem pendentes",
        "✅ Tarefas que foram aprovadas pelo professor",
        "📈 Seu nível atual e progresso"
      ]
    },
    {
      icon: Gamepad2,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      title: "Quizzes de Inglês 📚",
      description: "Aprenda inglês jogando quizzes divertidos!",
      points: [
        "📖 70 níveis progressivos de inglês",
        "🎯 Do básico ao avançado",
        "💰 Ganhe moedas a cada quiz completado",
        "⭐ Ganhe XP e suba de nível",
        "🎓 Aprenda vocabulário, gramática e traduções"
      ]
    },
    {
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-100",
      title: "Tarefas dos Professores ✏️",
      description: "Complete exercícios criados pelos seus professores!",
      points: [
        "📝 Tarefas personalizadas de inglês",
        "💰 Ganhe moedas ao completar",
        "⭐ Ganhe XP e suba de nível",
        "✅ Professor aprova e dá feedback",
        "📤 Envie respostas em texto ou arquivo"
      ]
    },
    {
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      title: "Loja de Recompensas 🎁",
      description: "Troque suas moedas por prêmios reais!",
      points: [
        "🛍️ Canecas, cofrinhos, livros e muito mais",
        "💰 Use as moedas que você ganhou",
        "📦 Receba os prêmios no seu endereço",
        "📊 Acompanhe o status da entrega",
        "🎉 Recompense seu esforço e dedicação!"
      ]
    },
    {
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      title: "Simulador de Investimentos 💹",
      description: "Aprenda educação financeira investindo suas moedas!",
      points: [
        "📈 Renda Fixa - investimento seguro",
        "🏢 Fundos Imobiliários - receba dividendos",
        "📊 Bolsa de Valores - médio risco",
        "₿ Bitcoin - alto risco e volatilidade",
        "💡 Aprenda sobre risco e retorno na prática!"
      ]
    },
    {
      icon: Flame,
      color: "text-red-500",
      bgColor: "bg-red-100",
      title: "Foguinho 🔥 - SUPER IMPORTANTE!",
      description: "O Foguinho é o seu indicador de dedicação diária!",
      points: [
        "🎯 COMO GANHAR 1 FOGUINHO POR DIA:",
        "   ✅ Complete pelo menos 1 quiz",
        "   ✅ Invista 10+ moedas em qualquer ativo",
        "⚠️ Só pode ganhar 1 foguinho por dia!",
        "🔥 Após ganhar, só aumenta novamente após 23:59",
        "🏆 Quanto mais foguinho, maior sua chance de ganhar no ranking!"
      ]
    },
    {
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      title: "Ranking do Mês 🏆",
      description: "Compete com seus colegas e ganhe PRÊMIOS INCRÍVEIS!",
      points: [
        "📊 Ranking baseado no seu FOGUINHO 🔥",
        "🥇 1º Lugar: 700 moedas + CERTIFICADO 🎓",
        "🥈 2º Lugar: 500 moedas + CERTIFICADO 🎓",
        "🥉 3º Lugar: 300 moedas + CERTIFICADO 🎓",
        "💰 Prêmios pagos no dia 1º do mês seguinte",
        "🎉 O campeão é reconhecido por sua dedicação!"
      ]
    },
    {
      icon: DollarSign,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      title: "Imposto de Renda 💳",
      description: "Aprenda sobre responsabilidade financeira!",
      points: [
        "📅 Todo mês você paga R$ 300 de imposto",
        "📆 Vencimento no dia 4 de cada mês",
        "💰 Pode pagar aos poucos durante o mês",
        "⚠️ Após o dia 4, cobra automaticamente",
        "🎓 Conceito importante de educação financeira"
      ]
    },
    {
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "IA Assistant 🤖",
      description: "Seu professor virtual sempre disponível!",
      points: [
        "💬 Tire dúvidas sobre inglês",
        "📚 Ajuda com educação financeira",
        "🎯 Respostas personalizadas para você",
        "✨ Disponível 24 horas por dia",
        "🎓 Como ter um professor particular!"
      ]
    }
  ];

  const teacherSteps = [
    {
      icon: Home,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "Bem-vindo, Professor! 👨‍🏫",
      description: "Vamos conhecer as ferramentas para gerenciar sua turma!",
      points: [
        "📝 Crie tarefas personalizadas",
        "✅ Corrija e dê feedback aos alunos",
        "👥 Acompanhe o progresso individual",
        "📊 Veja estatísticas da turma",
        "🎯 Motive seus alunos com recompensas"
      ]
    },
    {
      icon: Home,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "Dashboard do Professor 📊",
      description: "Seu painel de controle principal:",
      points: [
        "📝 Tarefas pendentes para corrigir",
        "📚 Total de tarefas criadas",
        "👥 Número de alunos na turma",
        "⚡ Ações rápidas",
        "📈 Visão geral do desempenho"
      ]
    },
    {
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-100",
      title: "Criar Tarefas ✏️",
      description: "Crie exercícios personalizados de inglês!",
      points: [
        "📝 Banco com mais de 50 tópicos prontos",
        "🎯 Defina a dificuldade (iniciante/intermediário/avançado)",
        "💰 Escolha a recompensa em moedas",
        "👥 Atribua para todos ou alunos específicos",
        "📅 Defina data de entrega"
      ]
    },
    {
      icon: Award,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      title: "Corrigir Tarefas ✅",
      description: "Avalie e dê feedback aos seus alunos:",
      points: [
        "📤 Veja tarefas enviadas pelos alunos",
        "✅ Aprove ou rejeite com justificativa",
        "💬 Dê orientações personalizadas",
        "💰 Moedas creditadas automaticamente",
        "⭐ XP atribuído ao aprovar tarefas"
      ]
    },
    {
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      title: "Gerenciar Alunos 👥",
      description: "Acompanhe o desempenho da sua turma:",
      points: [
        "📋 Lista completa de alunos",
        "📊 Progresso individual de cada uno",
        "🎯 Tarefas completadas",
        "💰 Moedas ganhas pelos alunos",
        "🏆 Identifique os destaques"
      ]
    }
  ];

  const parentSteps = [
    {
      icon: Home,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "Bem-vindo! 👨‍👩‍👧",
      description: "Acompanhe a evolução dos seus filhos na plataforma!",
      points: [
        "📈 Veja o progresso em tempo real",
        "📚 Atividades completadas",
        "💰 Como as moedas estão sendo usadas",
        "🎯 Metas e conquistas",
        "📊 Relatórios detalhados"
      ]
    },
    {
      icon: Home,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "Dashboard dos Pais 📊",
      description: "Seu painel de acompanhamento:",
      points: [
        "👥 Filhos cadastrados",
        "📈 Progresso médio",
        "🎯 Metas cumpridas",
        "📊 Visão geral semanal",
        "🔔 Notificações importantes"
      ]
    },
    {
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-100",
      title: "Acompanhar Progresso 📊",
      description: "Veja a evolução dos seus filhos:",
      points: [
        "📈 Gráficos de evolução no tempo",
        "📚 Tarefas completadas",
        "💰 Moedas ganhas e gastas",
        "🎯 Metas alcançadas",
        "📊 Relatórios semanais e mensais"
      ]
    },
    {
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      title: "Histórico Completo 📋",
      description: "Acesse todo o histórico de atividades:",
      points: [
        "✅ Tarefas aprovadas pelos professores",
        "🎁 Recompensas resgatadas",
        "💰 Todas as transações de moedas",
        "📚 Quizzes completados",
        "📈 Evolução mês a mês"
      ]
    }
  ];

  const getSteps = () => {
    if (user?.user_type === "professor") return teacherSteps;
    if (user?.user_type === "pais") return parentSteps;
    return studentSteps;
  };

  const handleNext = () => {
    if (currentStep < getSteps().length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await UserEntity.updateMyUserData({
        tutorial_completed: true
      });
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Erro ao finalizar tutorial:", error);
    }
  };

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

  const steps = getSteps();
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
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
            transition: all 0.2s ease;
          }
          .neumorphic-button:hover {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
          }
          .neumorphic-button:active {
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
          }
        `}
      </style>

      <div className="neumorphic-card p-6 md:p-10 max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 ${currentStepData.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <StepIcon className={`w-10 h-10 ${currentStepData.color}`} />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
          {currentStepData.title}
        </h2>

        {/* Description */}
        <p className="text-gray-700 text-center mb-6 text-lg">
          {currentStepData.description}
        </p>

        {/* Points */}
        <div className="neumorphic-card p-6 mb-8">
          <ul className="space-y-3">
            {currentStepData.points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`neumorphic-button px-6 py-3 font-medium flex items-center gap-2 ${
              currentStep === 0 ? "opacity-50 cursor-not-allowed" : "text-gray-800"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Anterior
          </button>

          <button
            onClick={currentStep === steps.length - 1 ? handleFinish : handleNext}
            className="neumorphic-button flex-1 px-6 py-3 font-medium text-green-800 flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? "Começar a Usar!" : "Próximo"}
            {currentStep === steps.length - 1 ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleFinish}
          className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Pular tutorial
        </button>
      </div>
    </div>
  );
}
