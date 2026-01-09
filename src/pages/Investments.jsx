
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Building2, Shield, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Investments() {
  const [user, setUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [amount, setAmount] = useState("");
  const [investing, setInvesting] = useState(false);
  const [investmentMessages, setInvestmentMessages] = useState([]);
  const [streak, setStreak] = useState(0); // Added for 'foguinho' display
  const [dailyQuizzesRemaining, setDailyQuizzesRemaining] = useState(4); // Added for 'foguinho' display
  const [sellingInvestment, setSellingInvestment] = useState(null);
  const [sellAmount, setSellAmount] = useState("");
  const [selling, setSelling] = useState(false);

  const updateInvestments = useCallback(async (investmentsList, userData) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = [];
    let totalDividends = 0;
    const messages = [];

    for (const inv of investmentsList) {
      const lastUpdate = inv.last_update_date || inv.purchase_date;
      const lastDate = new Date(lastUpdate);
      const nowDate = new Date(today);
      const daysDiff = Math.floor((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 1) {
        let newValue = inv.current_value;
        let dividendPaid = 0;

        for (let day = 0; day < daysDiff; day++) {
          if (inv.investment_type === "renda_fixa") {
            // Renda Fixa: +1% ao dia (sempre positivo)
            newValue = newValue * 1.01;
          }
          else if (inv.investment_type === "fii") {
            // FII: +0.8% de dividendo para conta corrente, -0.1% de desvalorização
            const dividend = inv.amount_coins * 0.008; // 0.8% do valor inicial investido
            dividendPaid += dividend;
            newValue = newValue * 0.999; // -0.1% de desvalorização
          }
          else if (inv.investment_type === "bolsa") {
            // Bolsa: -5% a +5% aleatório
            const randomChange = (Math.random() * 10 - 5) / 100; // -5% a +5%
            newValue = newValue * (1 + randomChange);
          }
          else if (inv.investment_type === "bitcoin") {
            // Bitcoin: -7% a +7% aleatório
            const randomChange = (Math.random() * 14 - 7) / 100; // -7% a +7%
            newValue = newValue * (1 + randomChange);
          }
        }

        // Arredondar para 2 casas decimais
        newValue = Math.round(newValue * 100) / 100;
        dividendPaid = Math.round(dividendPaid * 100) / 100;

        await base44.entities.Investment.update(inv.id, {
          current_value: newValue,
          last_update_date: today
        });

        // Se FII pagou dividendos
        if (dividendPaid > 0) {
          totalDividends += dividendPaid;
          const investmentName = investmentTypes.find(t => t.type === inv.investment_type)?.name || "Investimento";
          messages.push(`💰 Você ganhou ${dividendPaid.toFixed(2)} moedas com o seu ativo ${investmentName}!`);
        }

        updated.push({
          ...inv,
          current_value: newValue,
          last_update_date: today
        });
      } else {
        updated.push(inv);
      }
    }

    // Creditar dividendos na conta corrente
    if (totalDividends > 0) {
      await base44.auth.updateMe({
        coins_balance: parseFloat((userData.coins_balance + totalDividends).toFixed(2))
      });
    }

    return { updated, messages };
  }, []);

  const investmentTypes = [
    {
      type: "bitcoin",
      name: "Bitcoin",
      icon: Bitcoin,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      risk: "Alto",
      return: "-7% a +7% ao dia",
      description: "Alta volatilidade com grandes variações"
    },
    {
      type: "bolsa",
      name: "Bolsa de Valores",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      risk: "Médio-Alto",
      return: "-5% a +5% ao dia",
      description: "Ações com variação moderada"
    },
    {
      type: "fii",
      name: "Fundos Imobiliários",
      icon: Building2,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      risk: "Médio",
      return: "0.8% de dividendos ao dia",
      description: "Paga dividendos diários, leve desvalorização"
    },
    {
      type: "renda_fixa",
      name: "Renda Fixa",
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-100",
      risk: "Baixo",
      return: "1% ao dia",
      description: "Investimento seguro com retorno garantido"
    }
  ];

  const loadData = useCallback(async () => {
    try {
      const userData = await base44.auth.me();

      // Verificar mudança de dia e processar sequência
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().substring(0, 7);
      const lastCheck = userData.last_activity_check;

      let freshUser = userData; // Initialize with current user data
      if (lastCheck && lastCheck !== today) {
        let updateData = {
          last_activity_check: today,
          daily_investment_made: false, // Reset for new day
          daily_quiz_completed: false // Assuming this also needs to be reset daily
        };

        // Foguinho increment logic moved to task completion functions (e.g., handleInvest)
        // to ensure immediate update and avoid double counting.

        await base44.auth.updateMe(updateData);
        freshUser = await base44.auth.me(); // Fetch the user data after the daily reset
        setUser(freshUser);
        setStreak(freshUser.streak || 0); // Update streak state
        setDailyQuizzesRemaining(4 - (freshUser.daily_quizzes_count || 0)); // Update daily quizzes state
      } else {
        setUser(userData);
        setStreak(userData.streak || 0); // Update streak state on initial load
        setDailyQuizzesRemaining(4 - (userData.daily_quizzes_count || 0)); // Update daily quizzes state on initial load
      }

      const investmentsList = await base44.entities.Investment.filter({ user_id: freshUser.id, status: "ativo" });

      // Pass the most up-to-date user data to updateInvestments
      const { updated, messages } = await updateInvestments(investmentsList, freshUser);
      setInvestments(updated);
      setInvestmentMessages(messages);

      // Se há mensagens de dividendos, mostrar
      if (messages.length > 0) {
        alert(messages.join('\n\n'));
      }

    } catch (error) {
      console.error("Erro ao carregar investimentos:", error);
    } finally {
      setLoading(false);
    }
  }, [updateInvestments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvest = async () => {
    if (!selectedType || !amount || investing) return;

    const investAmount = parseInt(amount);
    if (isNaN(investAmount) || investAmount <= 0 || investAmount > (user?.coins_balance || 0)) {
      alert("Valor inválido ou moedas insuficientes!");
      return;
    }

    setInvesting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().substring(0, 7);

      const existingInvestment = investments.find(
        inv => inv.investment_type === selectedType.type && inv.status === "ativo"
      );

      if (existingInvestment) {
        await base44.entities.Investment.update(existingInvestment.id, {
          amount_coins: parseFloat((existingInvestment.amount_coins + investAmount).toFixed(2)),
          current_value: parseFloat((existingInvestment.current_value + investAmount).toFixed(2)),
          last_update_date: today
        });
      } else {
        await base44.entities.Investment.create({
          user_id: user.id,
          investment_type: selectedType.type,
          amount_coins: investAmount,
          current_value: investAmount,
          purchase_date: today,
          last_update_date: today,
          status: "ativo"
        });
      }

      const updateData = {
        coins_balance: parseFloat((user.coins_balance - investAmount).toFixed(2)),
        last_activity_check: today
      };

      if (investAmount >= 10) {
        updateData.daily_investment_made = true;

        // VERIFICAÇÃO CRÍTICA: Só aumentar foguinho se NUNCA aumentou hoje
        const lastStreakIncrease = user.last_streak_increase_date;
        const canIncreaseStreak = lastStreakIncrease !== today;

        if (user.daily_quiz_completed && canIncreaseStreak) {
          updateData.streak = (user.streak || 0) + 1;
          updateData.streak_month = currentMonth;
          updateData.last_streak_increase_date = today;
        }
      }

      await base44.auth.updateMe(updateData);

      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setStreak(updatedUser.streak || 0);
      setDailyQuizzesRemaining(4 - (updatedUser.daily_quizzes_count || 0));

      let message = existingInvestment
        ? `Você adicionou ${investAmount} moedas ao seu investimento em ${selectedType.name}!\n\nTotal investido agora: ${(existingInvestment.amount_coins + investAmount).toFixed(2)} moedas`
        : `Investimento de ${investAmount} moedas em ${selectedType.name} realizado com sucesso!`;

      if (investAmount >= 10) {
        const lastStreakIncrease = updatedUser.last_streak_increase_date;
        const canIncreaseStreak = lastStreakIncrease !== today;

        if (updatedUser.daily_quiz_completed && updatedUser.daily_investment_made && canIncreaseStreak) {
          message += `\n\n🔥 FOGUINHO AUMENTADO!`;
          message += `\n✅ Ambas tarefas completadas!`;
          message += `\n🔥 Seu foguinho agora é: ${updatedUser.streak} dias!`;
        } else if (!updatedUser.daily_quiz_completed) {
          message += `\n\n✅ Investimento completo! Falta: 1 Quiz`;
          message += `\n💡 Complete hoje para ganhar +1 no foguinho! 🔥`;
        } else if (!canIncreaseStreak) {
          message += `\n\n✅ Investimento completo!`;
          message += `\n🔥 Você já ganhou seu foguinho hoje!`;
          message += `\n⏰ Volte amanhã para aumentar novamente!`;
        }
      } else {
        message += `\n💡 Invista 10+ moedas para contar para o foguinho!`;
      }

      alert(message);
      setSelectedType(null);
      setAmount("");
      loadData();
    } catch (error) {
      console.error("Erro ao investir:", error);
      alert("Erro ao realizar investimento. Tente novamente.");
    } finally {
      setInvesting(false);
    }
  };

  const handleSellInvestment = async (investment) => {
    setSellingInvestment(investment);
    setSellAmount("");
  };

  const confirmSell = async () => {
    if (!sellingInvestment || !sellAmount || selling) return;

    const sellValue = parseFloat(sellAmount);
    if (isNaN(sellValue) || sellValue <= 0 || sellValue > sellingInvestment.current_value) {
      alert("Valor inválido! Digite um valor entre 0 e " + sellingInvestment.current_value.toFixed(2));
      return;
    }

    const typeInfo = investmentTypes.find(t => t.type === sellingInvestment.investment_type);
    if (!typeInfo) return;

    // Calcular proporções
    const percentageSelling = sellValue / sellingInvestment.current_value;
    const amountInvestedSelling = sellingInvestment.amount_coins * percentageSelling;
    
    // Calcular lucro/prejuízo sobre a parte vendida
    const profitOnSale = sellValue - amountInvestedSelling;
    
    // Taxa de 10% sobre o lucro (se houver)
    const taxOnProfit = profitOnSale > 0 ? profitOnSale * 0.10 : 0;
    const profitAfterTax = profitOnSale > 0 ? profitOnSale - taxOnProfit : profitOnSale;
    const finalValue = amountInvestedSelling + profitAfterTax;

    const profitPercent = amountInvestedSelling === 0 ? 0 : ((profitOnSale / amountInvestedSelling) * 100).toFixed(1);

    let message = `Tem certeza que deseja vender parte deste investimento?

${typeInfo.name}
Valor sendo vendido: ${sellValue.toFixed(2)} moedas
Valor investido (proporcional): ${amountInvestedSelling.toFixed(2)} moedas
${profitOnSale >= 0 ? 'Lucro bruto' : 'Prejuízo'}: ${profitOnSale.toFixed(2)} moedas (${profitPercent}%)`;

    if (profitOnSale > 0) {
      message += `
Taxa de 10% sobre o lucro: -${taxOnProfit.toFixed(2)} moedas
Lucro líquido: ${profitAfterTax.toFixed(2)} moedas

Você receberá: ${finalValue.toFixed(2)} moedas

🎉 Ótimo trabalho! Mesmo com a taxa, você teve lucro!`;
    } else {
      message += `

Você receberá: ${finalValue.toFixed(2)} moedas

⚠️ Atenção: Você terá um prejuízo de ${Math.abs(profitOnSale).toFixed(2)} moedas nesta venda.`;
    }

    // Calcular o que sobra no investimento
    const remainingCurrentValue = sellingInvestment.current_value - sellValue;
    const remainingAmountCoins = sellingInvestment.amount_coins - amountInvestedSelling;

    if (remainingCurrentValue > 0.01) { // Check against a small epsilon for floating point comparison
      message += `

📊 Restará no investimento:
Valor atual: ${remainingCurrentValue.toFixed(2)} moedas
Valor investido: ${remainingAmountCoins.toFixed(2)} moedas`;
    } else {
      message += `

✅ Você está vendendo TODO o investimento.`;
    }

    message += `

Deseja continuar com a venda?`;

    if (window.confirm(message)) {
      setSelling(true);
      try {
        // Se vender tudo (ou quase tudo), marca como vendido
        if (remainingCurrentValue <= 0.01) {
          await base44.entities.Investment.update(sellingInvestment.id, {
            status: "vendido"
          });
        } else {
          // Atualiza com os valores restantes
          await base44.entities.Investment.update(sellingInvestment.id, {
            amount_coins: parseFloat(remainingAmountCoins.toFixed(2)),
            current_value: parseFloat(remainingCurrentValue.toFixed(2))
          });
        }

        await base44.auth.updateMe({
          coins_balance: parseFloat((user.coins_balance + finalValue).toFixed(2))
        });

        let resultMessage = `Venda realizada com sucesso!`;
        if (profitOnSale > 0) {
          resultMessage += `\n\nLucro bruto: +${profitOnSale.toFixed(2)} moedas`;
          resultMessage += `\nTaxa (10% do lucro): -${taxOnProfit.toFixed(2)} moedas`;
          resultMessage += `\nLucro líquido: +${profitAfterTax.toFixed(2)} moedas creditado! 🎉`;
        } else {
          resultMessage += `\n\nPrejuízo de ${Math.abs(profitOnSale).toFixed(2)} moedas. 😔`;
          resultMessage += `\nNão se preocupe, faz parte do aprendizado!`;
        }

        if (remainingCurrentValue > 0.01) {
          resultMessage += `\n\n📊 Ainda resta ${remainingCurrentValue.toFixed(2)} moedas investidas.`;
        }

        alert(resultMessage);
        setSellingInvestment(null);
        setSellAmount("");
        loadData();
      } catch (error) {
        console.error("Erro ao vender investimento:", error);
        alert("Erro ao vender investimento. Tente novamente.");
      }
      setSelling(false);
    }
  };

  const calculateTotalValue = () => {
    return investments.reduce((sum, inv) => sum + inv.current_value, 0);
  };

  const calculateProfit = () => {
    const invested = investments.reduce((sum, inv) => sum + inv.amount_coins, 0);
    const current = calculateTotalValue();
    return (current - invested).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 h-screen flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
             style={{
               boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff"
             }}>
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados. Recarregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 overflow-x-hidden">
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
            box-shadow: inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff;
          }
          .neumorphic-input {
            background: #e0e0e0;
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            border: none;
            border-radius: 12px;
          }
          @media (min-width: 1024px) {
            .investment-card-icon {
              width: 48px;
              height: 48px;
            }
            .investment-card-title {
              font-size: 1.125rem;
            }
            .investment-card-description {
              font-size: 0.875rem;
            }
          }
          @media (max-width: 768px) {
            * {
              max-width: 100%;
            }
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        <div className="neumorphic-card p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-500" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Simulador de Investimentos</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Aprenda sobre investimentos de forma prática e segura!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="neumorphic-card p-3 md:p-6 text-center">
              <DollarSign className="w-5 h-5 md:w-8 md:h-8 text-blue-500 mx-auto mb-1 md:mb-2" />
              <h3 className="text-base md:text-2xl font-bold text-gray-800">{(user?.coins_balance || 0).toFixed(2)}</h3>
              <p className="text-[10px] md:text-sm text-gray-600">Moedas Disponíveis</p>
            </div>

            <div className="neumorphic-card p-3 md:p-6 text-center">
              <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-green-500 mx-auto mb-1 md:mb-2" />
              <h3 className="text-base md:text-2xl font-bold text-gray-800">{calculateTotalValue().toFixed(2)}</h3>
              <p className="text-[10px] md:text-sm text-gray-600">Valor Atual Investido</p>
            </div>

            <div className="neumorphic-card p-3 md:p-6 text-center">
              {parseFloat(calculateProfit()) >= 0 ? (
                <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-green-500 mx-auto mb-1 md:mb-2" />
              ) : (
                <TrendingDown className="w-5 h-5 md:w-8 md:h-8 text-red-500 mx-auto mb-1 md:mb-2" />
              )}
              <h3 className={`text-base md:text-2xl font-bold ${parseFloat(calculateProfit()) >= 0 ? "text-green-600" : "text-red-600"}`}>
                {parseFloat(calculateProfit()) >= 0 ? "+" : ""}{calculateProfit()}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-600">Lucro/Prejuízo Total</p>
            </div>
          </div>
        </div>

        {selectedType ? (
          <div className="neumorphic-card p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${selectedType.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <selectedType.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${selectedType.color}`} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{selectedType.name}</h2>
                <p className="text-sm sm:text-base text-gray-600">{selectedType.description}</p>
              </div>
              <button
                onClick={() => {setSelectedType(null); setAmount("");}}
                className="ml-auto p-2 rounded-full neumorphic-button text-gray-600 hover:text-gray-900"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div className="neumorphic-card p-4">
                <p className="text-sm text-gray-600">Risco</p>
                <p className="font-bold text-gray-800">{selectedType.risk}</p>
              </div>
              <div className="neumorphic-card p-4">
                <p className="text-sm text-gray-600">Retorno Esperado</p>
                <p className="font-bold text-gray-800">{selectedType.return}</p>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="invest-amount" className="block text-sm font-medium text-gray-700 mb-2">
                Quanto deseja investir?
              </label>
              <Input
                id="invest-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Digite a quantidade de moedas"
                className="neumorphic-input w-full p-3 md:p-4 text-base"
                min="1"
                max={user?.coins_balance || 0}
              />
              <p className="text-sm text-gray-600 mt-2">
                Disponível: 🪙 {(user?.coins_balance || 0).toFixed(2)} moedas
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSelectedType(null);
                  setAmount("");
                }}
                className="neumorphic-button px-6 py-3 text-gray-800 font-medium flex-1 text-base sm:text-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleInvest}
                disabled={investing || !amount || parseInt(amount) <= 0 || parseInt(amount) > (user?.coins_balance || 0)}
                className={`neumorphic-button px-6 py-3 font-medium flex-1 text-base sm:text-lg ${
                  investing || !amount || parseInt(amount) <= 0 || parseInt(amount) > (user?.coins_balance || 0)
                    ? "opacity-50 cursor-not-allowed"
                    : "text-green-800"
                }`}
              >
                {investing ? "Investindo..." : "Confirmar Investimento"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-8">
              {investmentTypes.map((type) => (
                <div key={type.type} className="neumorphic-card p-4 lg:p-5">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className={`investment-card-icon w-12 h-12 lg:w-12 lg:h-12 ${type.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                      <type.icon className={`w-6 h-6 lg:w-6 lg:h-6 ${type.color}`} />
                    </div>
                    <h3 className="investment-card-title text-base lg:text-lg font-bold text-gray-800 mb-1">{type.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">Risco: {type.risk}</p>
                  </div>
                  <p className="investment-card-description text-xs lg:text-sm text-gray-600 text-center mb-4 min-h-[2.5rem]">{type.description}</p>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-xs lg:text-sm font-bold text-green-600">{type.return}</span>
                  </div>
                  <button
                    onClick={() => setSelectedType(type)}
                    className="neumorphic-button w-full py-2 lg:py-3 text-sm lg:text-base font-medium text-gray-800"
                  >
                    Investir Agora
                  </button>
                </div>
              ))}
            </div>

            {investments.length > 0 && (
              <div className="neumorphic-card p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-6">Meus Investimentos</h2>
                <div className="space-y-3 sm:space-y-4">
                  {investments.map((inv) => {
                    const typeInfo = investmentTypes.find(t => t.type === inv.investment_type);
                    if (!typeInfo) return null;

                    const profit = inv.current_value - inv.amount_coins;
                    const profitPercent = inv.amount_coins === 0 ? 0 : ((profit / inv.amount_coins) * 100).toFixed(1);

                    return (
                      <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-200 rounded-xl gap-2 sm:gap-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 ${typeInfo.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <typeInfo.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 ${typeInfo.color}`} />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-800">{typeInfo.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Investido: 🪙 {inv.amount_coins.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Iniciado em: {inv.purchase_date}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                          <p className="text-sm sm:text-base font-bold text-gray-800">🪙 {inv.current_value.toFixed(2)}</p>
                          <p className={`text-xs sm:text-sm font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {profit >= 0 ? "+" : ""}{profit.toFixed(2)} ({profitPercent}%)
                          </p>
                          <button
                            onClick={() => handleSellInvestment(inv)}
                            className="mt-2 neumorphic-button px-4 py-1 text-xs sm:text-sm font-medium text-red-700 w-full sm:w-auto"
                          >
                            Vender
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de Venda Parcial */}
        {sellingInvestment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="neumorphic-card p-6 md:p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Vender Investimento</h2>
                <button
                  onClick={() => {
                    setSellingInvestment(null);
                    setSellAmount("");
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const typeInfo = investmentTypes.find(t => t.type === sellingInvestment.investment_type);
                    return typeInfo ? (
                      <>
                        <div className={`w-12 h-12 ${typeInfo.bgColor} rounded-xl flex items-center justify-center`}>
                          <typeInfo.icon className={`w-6 h-6 ${typeInfo.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{typeInfo.name}</h3>
                          <p className="text-sm text-gray-600">Valor atual: 🪙 {sellingInvestment.current_value.toFixed(2)}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>

                <div className="neumorphic-card p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Valor Investido:</p>
                      <p className="font-bold text-gray-800">🪙 {sellingInvestment.amount_coins.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Valor Atual:</p>
                      <p className="font-bold text-gray-800">🪙 {sellingInvestment.current_value.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quanto deseja resgatar?
                </label>
                <Input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="Digite o valor"
                  className="neumorphic-input w-full p-3 md:p-4 text-base"
                  min="0.01"
                  step="0.01"
                  max={sellingInvestment.current_value}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Máximo: 🪙 {sellingInvestment.current_value.toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Você pode vender parte ou todo o investimento
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSellingInvestment(null);
                    setSellAmount("");
                  }}
                  className="neumorphic-button flex-1 py-3 text-gray-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSell}
                  disabled={selling || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > sellingInvestment.current_value}
                  className={`neumorphic-button flex-1 py-3 font-medium ${
                    selling || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > sellingInvestment.current_value
                      ? "opacity-50 cursor-not-allowed"
                      : "text-green-800"
                  }`}
                >
                  {selling ? "Vendendo..." : "Confirmar Venda"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
