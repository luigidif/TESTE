
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, Trophy, TrendingUp, Gamepad2, DollarSign, Award, Bell, CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudentDashboard({ user, tasks, taxMessage, onTaxPaid }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [totalInvested, setTotalInvested] = useState(0);
  const [newTasksCount, setNewTasksCount] = useState(0); // Added state for new tasks count

  const pendingTasks = tasks.filter(t => t.status === "pendente").length;
  const completedTasks = tasks.filter(t => t.status === "aprovada").length;

  // Adicionar effect para calcular total investido
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        // Changed to use base44.entities.Investment
        const investments = await base44.entities.Investment.filter({ user_id: user.id, status: "ativo" });
        const total = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
        setTotalInvested(total);
      } catch (error) {
        console.error("Erro ao carregar investimentos:", error);
      }
    };

    if (user?.id) {
      loadInvestments();
    }
  }, [user?.id]); // Depend on user.id to reload if user changes

  // New useEffect to count and alert about new tasks
  useEffect(() => {
    // Contar tarefas novas (não visualizadas)
    const newTasks = tasks.filter(t => t.status === "pendente" && !t.viewed_by_student);
    setNewTasksCount(newTasks.length);

    // Mostrar alerta se há tarefas novas
    if (newTasks.length > 0) {
      const message = newTasks.length === 1
        ? `📝 Você tem 1 nova tarefa pendente!\n\n"${newTasks[0].title}"\n\nAcesse a aba Tarefas para começar.`
        : `📝 Você tem ${newTasks.length} novas tarefas pendentes!\n\nAcesse a aba Tarefas para ver todas.`;

      // Mostrar alerta apenas uma vez
      setTimeout(() => {
        alert(message);
      }, 500); // Small delay to ensure render is complete
    }
  }, [tasks]); // Depend on tasks to re-evaluate when tasks change

  const calculateProgress = () => {
    if (!user || !user.xp_points) return 0;
    const currentLevelXP = (user.level - 1) * 500;
    const nextLevelXP = user.level * 500;
    const progressXP = user.xp_points - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    if (levelRange <= 0) return 0; // Avoid division by zero for level 1 or if XP calculation is off
    return (progressXP / levelRange) * 100;
  };

  const getNextTaxDate = () => {
    const today = new Date();
    let nextTaxDate = new Date(today.getFullYear(), today.getMonth(), 4);

    if (today.getDate() >= 4) {
      nextTaxDate = new Date(today.getFullYear(), today.getMonth() + 1, 4);
    }

    return nextTaxDate.toLocaleDateString('pt-BR');
  };

  const getTaxRemaining = () => {
    const taxPaid = user.tax_paid || 0;
    const taxDue = user.tax_due || 300;
    return taxDue - taxPaid;
  };

  const getTaxProgress = () => {
    const taxPaid = user.tax_paid || 0;
    const taxDue = user.tax_due || 300;
    if (taxDue === 0) return 100; // If tax due is 0, consider it fully paid
    return (taxPaid / taxDue) * 100;
  };

  const handlePayTax = async () => {
    if (!paymentAmount || paying) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Digite um valor válido!");
      return;
    }

    const remaining = getTaxRemaining();
    const actualPayment = Math.min(amount, remaining);

    setPaying(true);
    try {
      const newBalance = user.coins_balance - actualPayment;
      const newTaxPaid = (user.tax_paid || 0) + actualPayment;

      await base44.auth.updateMe({
        coins_balance: newBalance,
        tax_paid: newTaxPaid
      });

      alert(`Pagamento de ${actualPayment.toFixed(2)} moedas realizado com sucesso!${remaining - actualPayment > 0 ? `\nFaltam ${(remaining - actualPayment).toFixed(2)} moedas para completar o imposto.` : "\nImposto pago totalmente! 🎉"}`);
      setPaymentAmount("");
      setShowPaymentModal(false);
      onTaxPaid();
    } catch (error) {
      console.error("Erro ao pagar imposto:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    }
    setPaying(false);
  };

  const isDayBeforeTax = () => {
    const today = new Date();
    return today.getDate() === 3;
  };

  const isOverdue = () => {
    const today = new Date();
    return today.getDate() > 4 && getTaxRemaining() > 0;
  };

  const getStatusText = (status) => {
    if (status === "aprovada") return "Aprovado";
    if (status === "rejeitada") return "Rejeitado";
    if (status === "enviada") return "Aguardando";
    return "Pendente";
  };

  const getStatusColor = (status) => {
    if (status === "aprovada") return "text-green-600";
    if (status === "rejeitada") return "text-red-600";
    if (status === "enviada") return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="p-4 md:p-6 overflow-x-hidden">
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
            display: block;
          }
          .neumorphic-button:hover {
            box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
            transform: translateY(-2px);
          }
          .neumorphic-input {
            background: #e0e0e0;
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            border: none;
            border-radius: 12px;
          }
          .action-link {
            transition: transform 0.2s ease;
          }
          .action-link:hover {
            transform: translateY(-4px);
          }
          .action-icon {
            box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .pulse {
            animation: pulse 2s infinite;
          }
          @keyframes celebrate {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .celebrate {
            animation: celebrate 0.5s ease-in-out;
          }
          @media (max-width: 768px) {
            * {
              max-width: 100%;
            }
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="neumorphic-card p-4 md:p-8 mb-4 md:mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6 overflow-hidden">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl flex-shrink-0">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-3xl font-bold text-gray-800 truncate">
                  Olá, {user.full_name?.split(' ')[0]}! 👋
                </h1>
                <span className="text-xs md:text-sm text-gray-500 bg-gray-300 px-2 py-1 rounded-full whitespace-nowrap">
                  Nv. {user.level || 1}
                </span>
              </div>
              <p className="text-sm md:text-base text-gray-600">Continue aprendendo e conquistando!</p>
            </div>
          </div>

          {/* Alerta de Novas Tarefas */}
          {newTasksCount > 0 && (
            <div className="neumorphic-card p-3 md:p-4 mb-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-blue-600 pulse" />
                <div className="flex-1">
                  <p className="text-sm md:text-base font-bold text-blue-800">
                    {newTasksCount === 1 ? "📝 Nova tarefa disponível!" : `📝 ${newTasksCount} novas tarefas disponíveis!`}
                  </p>
                  <p className="text-xs md:text-sm text-blue-600">Acesse a aba Tarefas para começar</p>
                </div>
                <Link
                  to={createPageUrl("StudentTasks")}
                  className="neumorphic-button px-4 py-2 text-sm font-medium text-blue-700 whitespace-nowrap"
                >
                  Ver Agora
                </Link>
              </div>
            </div>
          )}

          {/* Tax Alert */}
          {taxMessage && (
            <div className={`neumorphic-card p-3 md:p-4 mb-4 ${taxMessage.includes('⚠️') ? 'bg-red-50' : taxMessage.includes('cobrado') ? 'bg-yellow-50' : 'bg-blue-50'}`}>
              <p className="text-sm md:text-base font-medium text-gray-800 break-words">{taxMessage}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <div className="neumorphic-card p-3 md:p-6 text-center">
              <div className="text-2xl md:text-3xl mb-2">🪙</div>
              <h3 className={`text-lg md:text-2xl font-bold mb-1 ${user.coins_balance < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                {user.coins_balance.toFixed(2)}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">Moedas</p>
            </div>

            <div className="neumorphic-card p-3 md:p-6 text-center">
              <div className="text-2xl md:text-3xl mb-2">💰</div>
              <h3 className="text-lg md:text-2xl font-bold text-green-500 mb-1">
                {totalInvested.toFixed(2)}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">Dinheiro Investido</p>
            </div>

            <div className="neumorphic-card p-3 md:p-6 text-center">
              <div className="text-2xl md:text-3xl mb-2">📝</div>
              <h3 className="text-lg md:text-2xl font-bold text-blue-500 mb-1">
                {pendingTasks}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">Pendentes</p>
            </div>

            <div className="neumorphic-card p-3 md:p-6 text-center bg-gradient-to-br from-green-50 to-green-100 celebrate">
              <div className="text-2xl md:text-3xl mb-2">✅</div>
              <h3 className="text-lg md:text-2xl font-bold text-green-600 mb-1">
                {completedTasks}
              </h3>
              <p className="text-xs md:text-sm text-green-700 font-semibold">Aprovadas</p>
              {completedTasks > 0 && (
                <p className="text-[10px] md:text-xs text-green-600 mt-1">🎉 Parabéns!</p>
              )}
            </div>
          </div>

          {/* Foguinho e Nível - MOBILE */}
          <div className="grid grid-cols-1 md:hidden gap-3 mb-4">
            <div className="neumorphic-card p-3 text-center">
              <div className="text-2xl mb-2">🔥</div>
              <h3 className="text-lg font-bold text-red-500 mb-1">
                {user.streak || 0}
              </h3>
              <p className="text-xs text-gray-600">Foguinho (mês)</p>
              {(!user.daily_quiz_completed || !user.daily_investment_made) && (
                <p className="text-[10px] text-orange-600 mt-1">
                  {!user.daily_quiz_completed && !user.daily_investment_made
                    ? "Faltam: Quiz + Investir 10+"
                    : !user.daily_quiz_completed
                      ? "Falta: 1 Quiz"
                      : "Falta: Investir 10+"}
                </p>
              )}
              {user.daily_quiz_completed && user.daily_investment_made && (
                <p className="text-[10px] text-green-600 mt-1">✅ Tarefas completas hoje!</p>
              )}
            </div>
          </div>

          {/* Tax Payment Card - MOBILE (abaixo do foguinho) */}
          <div className={`md:hidden neumorphic-card p-3 mb-4 ${
            isOverdue() ? 'bg-red-50' : isDayBeforeTax() ? 'bg-yellow-50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className={`w-5 h-5 flex-shrink-0 ${isOverdue() ? 'text-red-600' : 'text-blue-600'}`} />
              <h3 className="text-sm font-bold text-gray-800">Imposto de Renda Mensal</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Total Devido</p>
                <p className="text-sm font-bold text-gray-800">{(user.tax_due || 300).toFixed(2)} 🪙</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Já Pago</p>
                <p className="text-sm font-bold text-green-600">{(user.tax_paid || 0).toFixed(2)} 🪙</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Falta Pagar</p>
                <p className={`text-sm font-bold ${getTaxRemaining() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {getTaxRemaining().toFixed(2)} 🪙
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Progresso</span>
                <span className="text-xs font-bold text-gray-800">{getTaxProgress().toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    getTaxProgress() >= 100 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(getTaxProgress(), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center mb-3">
              <span className="text-xs text-gray-600">Próximo vencimento: </span>
              <span className="text-xs font-bold text-gray-800">{getNextTaxDate()}</span>
            </div>

            {getTaxRemaining() > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="neumorphic-button w-full py-2 text-sm font-bold text-blue-700"
              >
                Pagar Imposto Agora
              </button>
            )}

            {getTaxRemaining() <= 0 && (
              <div className="mt-2 p-3 bg-green-100 rounded-xl text-center">
                <p className="text-sm font-bold text-green-800">✓ Imposto pago! Você está em dia! 🎉</p>
              </div>
            )}
          </div>

          {/* Foguinho e Nível - DESKTOP */}
          <div className="hidden md:grid md:grid-cols-2 gap-6 mb-6">
            <div className="neumorphic-card p-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="text-2xl font-bold text-red-500 mb-1">
                {user.streak || 0}
              </h3>
              <p className="text-sm text-gray-600">Foguinho (mês)</p>
              {(!user.daily_quiz_completed || !user.daily_investment_made) && (
                <p className="text-xs text-orange-600 mt-1">
                  {!user.daily_quiz_completed && !user.daily_investment_made
                    ? "Faltam: Quiz + Investir 10+"
                    : !user.daily_quiz_completed
                      ? "Falta: 1 Quiz"
                      : "Falta: Investir 10+"}
                </p>
              )}
              {user.daily_quiz_completed && user.daily_investment_made && (
                <p className="text-xs text-green-600 mt-1">✅ Tarefas completas hoje!</p>
              )}
            </div>

            <div className="neumorphic-card p-6 text-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 mb-1">Nível {user.level || 1}</h3>
              <p className="text-sm text-gray-600">Nível Atual</p>
            </div>
          </div>

          {/* Tax Payment Card - DESKTOP (abaixo do foguinho e nível) */}
          <div className={`hidden md:block neumorphic-card p-6 mb-6 ${
            isOverdue() ? 'bg-red-50' : isDayBeforeTax() ? 'bg-yellow-50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className={`w-6 h-6 flex-shrink-0 ${isOverdue() ? 'text-red-600' : 'text-blue-600'}`} />
              <h3 className="text-lg font-bold text-gray-800">Imposto de Renda Mensal</h3>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Total Devido</p>
                <p className="text-xl font-bold text-gray-800">{(user.tax_due || 300).toFixed(2)} 🪙</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Já Pago</p>
                <p className="text-xl font-bold text-green-600">{(user.tax_paid || 0).toFixed(2)} 🪙</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Falta Pagar</p>
                <p className={`text-xl font-bold ${getTaxRemaining() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {getTaxRemaining().toFixed(2)} 🪙
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progresso</span>
                <span className="text-sm font-bold text-gray-800">{getTaxProgress().toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    getTaxProgress() >= 100 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(getTaxProgress(), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center mb-3">
              <span className="text-sm text-gray-600">Próximo vencimento: </span>
              <span className="text-sm font-bold text-gray-800">{getNextTaxDate()}</span>
            </div>

            {getTaxRemaining() > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="neumorphic-button w-full py-3 text-base font-bold text-blue-700"
              >
                Pagar Imposto Agora
              </button>
            )}

            {getTaxRemaining() <= 0 && (
              <div className="mt-2 p-3 bg-green-100 rounded-xl text-center">
                <p className="text-base font-bold text-green-800">✓ Imposto pago! Você está em dia! 🎉</p>
              </div>
            )}
          </div>

          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="neumorphic-card p-6 md:p-8 max-w-md w-full mx-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Pagar Imposto</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  Faltam <strong>{getTaxRemaining().toFixed(2)} moedas</strong> para completar o pagamento do imposto.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Seu saldo: <strong>{user.coins_balance.toFixed(2)} 🪙</strong>
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quanto deseja pagar?
                  </label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Digite o valor"
                    className="neumorphic-input w-full p-3 md:p-4"
                    min="0.01"
                    step="0.01"
                    max={getTaxRemaining()}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Máximo: {getTaxRemaining().toFixed(2)} moedas
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentAmount("");
                    }}
                    className="neumorphic-button flex-1 py-3 text-gray-800 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePayTax}
                    disabled={paying || !paymentAmount || parseFloat(paymentAmount) <= 0}
                    className={`neumorphic-button flex-1 py-3 font-medium ${
                      paying || !paymentAmount || parseFloat(paymentAmount) <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "text-green-800"
                    }`}
                  >
                    {paying ? "Pagando..." : "Confirmar Pagamento"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="neumorphic-card p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm md:text-base font-bold text-gray-800">Progresso para Nível {(user.level || 1) + 1}</span>
              <span className="text-xs md:text-sm text-gray-600">{Math.floor(calculateProgress())}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 md:h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 md:h-4 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {user.xp_points || 0} / {(user.level || 1) * 500} XP
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Link
            to={createPageUrl("MiniGame")}
            className="action-link flex flex-col items-center gap-2 md:gap-3"
          >
            <div className="action-icon w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-sm md:text-base font-bold text-gray-800 text-center">Quizzes</span>
          </Link>

          <Link
            to={createPageUrl("StudentTasks")}
            className="action-link flex flex-col items-center gap-2 md:gap-3"
          >
            <div className="action-icon w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-sm md:text-base font-bold text-gray-800 text-center">Tarefas</span>
          </Link>

          <Link
            to={createPageUrl("RewardStore")}
            className="action-link flex flex-col items-center gap-2 md:gap-3"
          >
            <div className="action-icon w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-sm md:text-base font-bold text-gray-800 text-center">Loja</span>
          </Link>

          <Link
            to={createPageUrl("Investments")}
            className="action-link flex flex-col items-center gap-2 md:gap-3"
          >
            <div className="action-icon w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-sm md:text-base font-bold text-gray-800 text-center">Investimentos</span>
          </Link>
        </div>

        {/* Tarefas Aprovadas */}
        {tasks.filter(t => t.status === "aprovada").length > 0 && (
          <div className="neumorphic-card p-4 md:p-6 mb-6 md:mb-8 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                Tarefas Aprovadas
              </h2>
              <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm md:text-base">
                {completedTasks} ✅
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              {tasks.filter(t => t.status === "aprovada").slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-xl overflow-hidden border-2 border-green-300 shadow-md">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 bg-green-500" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-medium text-gray-800 truncate">{task.title}</h3>
                    <p className="text-xs md:text-sm font-medium text-green-600 flex items-center gap-1">
                      Aprovada • <DollarSign className="w-3 h-3 md:w-4 md:h-4" /> +{(task.coin_reward || 0).toFixed(2)}, <Award className="w-3 h-3 md:w-4 md:h-4" /> +{task.xp_reward || 50} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {completedTasks > 3 && (
              <p className="text-xs md:text-sm text-green-700 text-center mt-3">
                E mais {completedTasks - 3} tarefa{completedTasks - 3 > 1 ? 's' : ''} aprovada{completedTasks - 3 > 1 ? 's' : ''}! 🎊
              </p>
            )}
          </div>
        )}

        {/* Tarefas Recentes */}
        {tasks.length > 0 && (
          <div className="neumorphic-card p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Tarefas Recentes</h2>
            <div className="space-y-2 md:space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-200 rounded-xl overflow-hidden">
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                    task.status === "aprovada" ? "bg-green-500" :
                    task.status === "rejeitada" ? "bg-red-500" :
                    task.status === "enviada" ? "bg-yellow-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-medium text-gray-800 truncate">{task.title}</h3>
                    <p className={`text-xs md:text-sm font-medium ${getStatusColor(task.status)} flex items-center gap-1`}>
                      {getStatusText(task.status)}
                      {task.status === "aprovada" && (
                        <>
                          {' '}• <DollarSign className="w-3 h-3 md:w-4 md:h-4" /> +{(task.coin_reward || 0).toFixed(2)}, <Award className="w-3 h-3 md:w-4 md:h-4" /> +{task.xp_reward || 50} XP
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
