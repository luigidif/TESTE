import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

import StudentDashboard from "../components/dashboards/StudentDashboard";
import TeacherDashboard from "../components/dashboards/TeacherDashboard";
// ParentDashboard import removed as per changes

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taxMessage, setTaxMessage] = useState("");

  const checkAndGiveMonthlySalaryAndPrizes = async (userData) => {
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7); // YYYY-MM
    const isFirstDayOfMonth = today.getDate() === 1;

    const lastBonusMonth = userData.last_bonus_month;

    // Se é dia 1 e ainda não recebeu o salário deste mês
    if (isFirstDayOfMonth && lastBonusMonth !== currentMonth) {
      try {
        // CRÍTICO: Buscar todos os usuários e verificar se ALGUÉM já recebeu bônus este mês
        const allUsers = await base44.entities.User.list();
        const someoneAlreadyReceivedBonus = allUsers.some(u => u.last_bonus_month === currentMonth);

        // Se NINGUÉM recebeu ainda, significa que somos o PRIMEIRO usuário do mês
        // Então processamos os prêmios para TODOS de uma vez, baseado no ranking do mês ANTERIOR
        if (!someoneAlreadyReceivedBonus) {
          console.log("🎉 PRIMEIRO USUÁRIO DO MÊS! Processando prêmios do ranking e resetando foguinhos...");

          // Buscar ranking do mês anterior (ANTES de qualquer reset de streak)
          const rankingEntries = await base44.entities.RankingEntry.list("-streak");

          // Filtrar apenas estudantes válidos COM STREAK > 0
          const validUserIds = new Set(allUsers.filter(u => u.user_type === "estudante").map(u => u.id));
          const validEntries = rankingEntries
            .filter(entry => entry.user_id && validUserIds.has(entry.user_id) && (entry.streak || 0) > 0)
            .sort((a, b) => (b.streak || 0) - (a.streak || 0));

          console.log("📊 Ranking completo:", validEntries.map(e => ({
            nome: e.full_name,
            foguinho: e.streak
          })));

          // Agrupar por posições considerando empates
          const groupByPosition = () => {
            if (validEntries.length === 0) return { first: [], second: [], third: [] };

            const positions = { first: [], second: [], third: [] };

            validEntries.forEach((entry, index) => {
              if (index === 0) {
                positions.first.push(entry);
              } else if (entry.streak === validEntries[0].streak) {
                positions.first.push(entry);
              } else if (positions.second.length === 0) {
                positions.second.push(entry);
              } else if (entry.streak === positions.second[0].streak) {
                positions.second.push(entry);
              } else if (positions.third.length === 0) {
                positions.third.push(entry);
              } else if (entry.streak === positions.third[0].streak) {
                positions.third.push(entry);
              }
            });

            return positions;
          };

          const positions = groupByPosition();

          console.log("🏆 Posições do ranking:");
          console.log("1º Lugar:", positions.first.map(e => e.full_name));
          console.log("2º Lugar:", positions.second.map(e => e.full_name));
          console.log("3º Lugar:", positions.third.map(e => e.full_name));

          // Processar prêmios para os top 3 (considerando empates)
          const prizesConfig = [
            { group: positions.first, prize: 500, total: 700, positionName: "1º LUGAR" },
            { group: positions.second, prize: 300, total: 500, positionName: "2º LUGAR" },
            { group: positions.third, prize: 100, total: 300, positionName: "3º LUGAR" }
          ];

          const winnersIds = new Set();

          for (const { group, prize, total, positionName } of prizesConfig) {
            for (const entry of group) {
              const winner = allUsers.find(u => u.id === entry.user_id);

              if (winner) {
                const totalCoins = 200 + prize;

                await base44.entities.User.update(winner.id, {
                  coins_balance: parseFloat((winner.coins_balance + totalCoins).toFixed(2)),
                  last_bonus_month: currentMonth,
                  streak: 0, // RESETAR FOGUINHO
                  streak_month: currentMonth,
                  daily_quiz_completed: false,
                  daily_investment_made: false,
                  last_streak_increase_date: null
                });

                winnersIds.add(winner.id);

                console.log(`✅ 🏆 ${positionName} - ${winner.full_name} recebeu ${totalCoins} moedas e foguinho resetado!`);
              }
            }
          }

          // Dar salário base (200 moedas) e RESETAR FOGUINHO para TODOS os outros estudantes
          for (const u of allUsers) {
            if (u.user_type === "estudante" && u.last_bonus_month !== currentMonth && !winnersIds.has(u.id)) {
              await base44.entities.User.update(u.id, {
                coins_balance: parseFloat((u.coins_balance + 200).toFixed(2)),
                last_bonus_month: currentMonth,
                streak: 0, // RESETAR FOGUINHO
                streak_month: currentMonth,
                daily_quiz_completed: false,
                daily_investment_made: false,
                last_streak_increase_date: null
              });

              console.log(`💰 Salário mensal de 200 moedas para ${u.full_name} e foguinho resetado!`);
            }
          }

          // CRÍTICO: Resetar todas as entradas do ranking também
          const allRankingEntries = await base44.entities.RankingEntry.list();
          for (const entry of allRankingEntries) {
            try {
              await base44.entities.RankingEntry.update(entry.id, {
                streak: 0,
                last_updated: new Date().toISOString()
              });
            } catch (error) {
              console.error(`Erro ao resetar ranking entry ${entry.id}:`, error);
            }
          }

          console.log("✅ Todos os prêmios e salários foram distribuídos e foguinhos resetados!");
        }
        
        // Agora verificar especificamente para ESTE usuário
        const updatedUser = await base44.auth.me();
        
        if (updatedUser.last_bonus_month !== currentMonth) {
          // Este usuário ainda não recebeu (possível erro anterior)
          await base44.auth.updateMe({
            coins_balance: parseFloat((updatedUser.coins_balance + 200).toFixed(2)),
            last_bonus_month: currentMonth
          });
          
          alert("💰 Salário Mensal!\n\n+200 moedas creditadas!\n\nBom início de mês! 🪙");
        } else {
          // Usuário já recebeu, mostrar mensagem apropriada
          const rankingEntries = await base44.entities.RankingEntry.list("-streak");
          const validUserIds = new Set(allUsers.filter(u => u.user_type === "estudante").map(u => u.id));
          const validEntries = rankingEntries
            .filter(entry => entry.user_id && validUserIds.has(entry.user_id) && (entry.streak || 0) > 0)
            .sort((a, b) => (b.streak || 0) - (a.streak || 0));
          
          // Calcular posição do usuário considerando empates
          let userPosition = null;
          let currentPos = 1;
          
          for (let i = 0; i < validEntries.length; i++) {
            if (validEntries[i].user_id === updatedUser.id) {
              userPosition = currentPos;
              break;
            }
            
            // Se o próximo tem streak diferente, incrementa posição
            if (i + 1 < validEntries.length && validEntries[i + 1].streak !== validEntries[i].streak) {
              currentPos = i + 2; // Próxima posição
            }
          }
          
          let message = "";
          if (userPosition === 1) {
            message = "🏆 CAMPEÃO DO MÊS!\n\n💰 Salário: +200 moedas\n🎉 Prêmio 1º Lugar: +500 moedas\n\nTotal: +700 moedas creditadas!\n\nParabéns! 🎊";
          } else if (userPosition === 2) {
            message = "🥈 2º LUGAR DO MÊS!\n\n💰 Salário: +200 moedas\n🎉 Prêmio 2º Lugar: +300 moedas\n\nTotal: +500 moedas creditadas!\n\nMuito bem! 🎊";
          } else if (userPosition === 3) {
            message = "🥉 3º LUGAR DO MÊS!\n\n💰 Salário: +200 moedas\n🎉 Prêmio 3º Lugar: +100 moedas\n\nTotal: +300 moedas creditadas!\n\nParabéns! 🎊";
          } else {
            message = "💰 Salário Mensal!\n\n+200 moedas creditadas!\n\nBom início de mês! 🪙";
          }
          
          alert(message);
        }
        
      } catch (error) {
        console.error("Erro ao processar salário e prêmios:", error);
        // Em caso de erro, dar apenas o salário base se ainda não recebeu
        if (userData.last_bonus_month !== currentMonth) {
          await base44.auth.updateMe({
            coins_balance: parseFloat((userData.coins_balance + 200).toFixed(2)),
            last_bonus_month: currentMonth
          });
          alert("💰 Salário Mensal!\n\n+200 moedas creditadas!\n\nBom início de mês! 🪙");
        }
      }
    }
  };

  const checkAndUpdateDailyProgress = async (userData) => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const lastCheck = userData.last_activity_check;
    const streakMonth = userData.streak_month; // Updated from foguinhoMonth
    
    // Verificar se mudou de mês - reseta foguinho
    if (streakMonth && streakMonth !== currentMonth) { // Updated from foguinhoMonth
      await base44.auth.updateMe({
        streak: 0, // Updated from foguinho
        streak_month: currentMonth, // Updated from foguinho_month
        daily_quiz_completed: false,
        daily_investment_made: false,
        last_activity_check: today,
        last_streak_increase_date: null // Added this line as per outline
      });
      return;
    }
    
    // Verificar se mudou de dia (passou da meia-noite)
    if (lastCheck && lastCheck !== today) {
      let updateData = {
        last_activity_check: today,
        streak_month: currentMonth, // Updated from foguinho_month
        daily_quiz_completed: false, // Reset for the new day
        daily_investment_made: false // Reset for the new day
        // NÃO resetar last_streak_increase_date aqui - ele deve permanecer para comparação
      };
      
      // Apenas reseta as flags ao mudar de dia
      // O foguinho é aumentado IMEDIATAMENTE quando as tarefas são completadas
      
      await base44.auth.updateMe(updateData);
    } else if (!streakMonth) { // Updated from foguinhoMonth
      // Primeira vez - inicializa
      await base44.auth.updateMe({
        streak_month: currentMonth, // Updated from foguinho_month
        last_activity_check: today
      });
    }
  };

  const checkAndChargeMonthlyTax = async (userData) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const lastTaxDate = userData.last_tax_date;
    
    // Inicializar campos de imposto se não existirem
    if (userData.tax_paid === undefined || userData.tax_due === undefined) {
      await base44.auth.updateMe({
        tax_paid: 0,
        tax_due: 300,
        last_tax_date: today.toISOString().split('T')[0]
      });
      return;
    }

    // Se hoje é dia 4 ou passou do dia 4
    if (currentDay >= 4) {
      if (!lastTaxDate) {
        // Primeira vez - cobra o imposto
        const remaining = userData.tax_due - userData.tax_paid;
        if (remaining > 0) {
          await base44.auth.updateMe({
            coins_balance: userData.coins_balance - remaining,
            tax_paid: 0,
            tax_due: 300,
            last_tax_date: today.toISOString().split('T')[0]
          });
          setTaxMessage(`⚠️ Imposto de Renda cobrado: ${remaining.toFixed(2)} moedas (saldo pode ficar negativo)`);
        } else {
          await base44.auth.updateMe({
            tax_paid: 0,
            tax_due: 300,
            last_tax_date: today.toISOString().split('T')[0]
          });
        }
      } else {
        const lastTax = new Date(lastTaxDate);
        const lastTaxMonth = lastTax.getMonth();
        const lastTaxYear = lastTax.getFullYear();

        // Verifica se mudou de mês
        const monthsPassed = (currentYear - lastTaxYear) * 12 + (currentMonth - lastTaxMonth);
        
        if (monthsPassed >= 1) {
          const remaining = userData.tax_due - userData.tax_paid;
          if (remaining > 0) {
            // Cobra o restante do imposto (pode ficar negativo)
            await base44.auth.updateMe({
              coins_balance: userData.coins_balance - remaining,
              tax_paid: 0,
              tax_due: 300,
              last_tax_date: today.toISOString().split('T')[0]
            });
            setTaxMessage(`⚠️ Imposto de Renda cobrado: ${remaining.toFixed(2)} moedas (saldo pode ficar negativo)`);
          } else {
            // Já pagou tudo, apenas reseta
            await base44.auth.updateMe({
              tax_paid: 0,
              tax_due: 300,
              last_tax_date: today.toISOString().split('T')[0]
            });
          }
        }
      }
    }
  };

  const processApprovedTasks = async (userData) => {
    // Buscar tarefas aprovadas que ainda não foram creditadas
    const allApprovedTasks = await base44.entities.Task.filter({ 
      status: "aprovada"
    });

    // Filtrar apenas tarefas deste aluno que ainda não foram creditadas
    const approvedTasks = allApprovedTasks.filter(task => {
      const isForEveryone = !task.student_id || task.student_id === "";
      const isForMe = task.student_id === userData.id;
      const notCredited = !task.credited; // Check if already credited
      return (isForEveryone || isForMe) && notCredited;
    });

    if (approvedTasks.length === 0) return;

    let totalCoins = 0;
    let totalXP = 0;
    let tasksToUpdate = [];

    for (const task of approvedTasks) {
      totalCoins += task.coin_reward || 0;
      totalXP += task.xp_reward || 50;
      tasksToUpdate.push(task.id);
    }

    if (totalCoins > 0 || totalXP > 0) {
      const newXP = (userData.xp_points || 0) + totalXP;
      const newLevel = Math.floor(newXP / 500) + 1;
      
      await base44.auth.updateMe({
        coins_balance: parseFloat(((userData.coins_balance || 0) + totalCoins).toFixed(2)),
        xp_points: newXP,
        level: newLevel
      });

      // Marcar tarefas como creditadas, mas manter status "aprovada"
      for (const taskId of tasksToUpdate) {
        await base44.entities.Task.update(taskId, { credited: true });
      }

      let message = `🎉 ${approvedTasks.length} ${approvedTasks.length === 1 ? 'tarefa aprovada' : 'tarefas aprovadas'}!\n`;
      message += `+${totalCoins} moedas e +${totalXP} XP creditados!`;
      
      if (newLevel > (userData.level || 1)) {
        message += `\n🎊 Você subiu para o nível ${newLevel}!`;
      }
      
      alert(message);
    }
  };

  const cleanAndUpdateRankingEntry = async (userData) => {
    try {
      // Buscar TODAS as entradas para este usuário
      const existingEntries = await base44.entities.RankingEntry.filter({ user_id: userData.id });
      
      // Se houver mais de uma entrada (duplicatas), deletar todas com segurança
      if (existingEntries.length > 1) {
        console.log(`Limpando ${existingEntries.length} entradas duplicadas do usuário ${userData.full_name}`);
        for (const entry of existingEntries) {
          try {
            await base44.entities.RankingEntry.delete(entry.id);
          } catch (deleteError) {
            // Se falhar ao deletar (entrada já não existe), apenas continuar
            console.log(`Entrada ${entry.id} já foi deletada ou não existe mais`);
          }
        }
      } else if (existingEntries.length === 1) {
        // Se houver apenas uma, deletar também para recriar com dados atualizados
        try {
          await base44.entities.RankingEntry.delete(existingEntries[0].id);
        } catch (deleteError) {
          // Se falhar ao deletar (entrada já não existe), apenas continuar
          console.log(`Entrada ${existingEntries[0].id} já foi deletada ou não existe mais`);
        }
      }
      
      // Criar uma nova entrada com os dados atualizados e corretos
      const rankingData = {
        user_id: userData.id,
        full_name: userData.full_name || "Estudante",
        profile_picture: userData.profile_picture || "",
        streak: userData.streak || 0,
        level: userData.level || 1,
        coins_balance: parseFloat((userData.coins_balance || 0).toFixed(2)),
        last_updated: new Date().toISOString()
      };

      await base44.entities.RankingEntry.create(rankingData);
      console.log(`✅ Ranking atualizado para ${userData.full_name}: streak = ${userData.streak || 0}`);
      
    } catch (error) {
      console.error("Erro ao atualizar ranking:", error);
      // Mesmo com erro, tentar criar uma nova entrada
      try {
        const rankingData = {
          user_id: userData.id,
          full_name: userData.full_name || "Estudante",
          profile_picture: userData.profile_picture || "",
          streak: userData.streak || 0,
          level: userData.level || 1,
          coins_balance: parseFloat((userData.coins_balance || 0).toFixed(2)),
          last_updated: new Date().toISOString()
        };
        await base44.entities.RankingEntry.create(rankingData);
        console.log(`✅ Ranking criado com sucesso após erro na limpeza`);
      } catch (createError) {
        console.error("Erro crítico ao criar entrada no ranking:", createError);
      }
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await base44.auth.me(); // Using base44.auth.me()
      
      if (!userData.onboarding_completed) {
        navigate(createPageUrl("Onboarding"));
        return;
      }

      // Verificar se precisa fazer o tutorial
      if (!userData.tutorial_completed) {
        navigate(createPageUrl("Tutorial"));
        return;
      }
      
      if (userData.user_type === "estudante") {
        await checkAndGiveMonthlySalaryAndPrizes(userData);
        await checkAndUpdateDailyProgress(userData);
        await processApprovedTasks(userData);
        await checkAndChargeMonthlyTax(userData);
        
        // Atualizar entrada no ranking (com limpeza automática)
        const refreshedUserForRanking = await base44.auth.me();
        await cleanAndUpdateRankingEntry(refreshedUserForRanking);
      }
      
      const refreshedUser = await base44.auth.me(); // Using base44.auth.me()
      setUser(refreshedUser);
      
      if (refreshedUser.user_type === "estudante") {
        // Buscar TODAS as tarefas do estudante
        const allTasks = await base44.entities.Task.list("-created_date"); // Using base44.entities.Task.list()
        
        // Filtrar apenas tarefas relevantes para este aluno
        const myTasks = allTasks.filter(task => {
          // Incluir se é para todos OU se é específica para este aluno
          const isForEveryone = !task.student_id || task.student_id === "";
          const isForMe = task.student_id === refreshedUser.id;
          
          return isForEveryone || isForMe;
        });
        
        // Ordenar: aprovadas primeiro, depois por data
        const sortedTasks = myTasks.sort((a, b) => {
          if (a.status === "aprovada" && b.status !== "aprovada") return -1;
          if (a.status !== "aprovada" && b.status === "aprovada") return 1;
          return new Date(b.created_date) - new Date(a.created_date);
        });
        
        // Pegar as 10 mais recentes/relevantes
        setTasks(sortedTasks.slice(0, 10));
      } else if (refreshedUser.user_type === "professor") {
        const teacherTasks = await base44.entities.Task.filter({ teacher_id: refreshedUser.id }, "-created_date", 10); // Using base44.entities.Task.filter()
        setTasks(teacherTasks);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      // Retry após 2 segundos em vez de redirecionar
      setTimeout(() => loadDashboardData(), 2000);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
             style={{
               boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff"
             }}>
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (user?.user_type === "estudante") {
    return <StudentDashboard user={user} tasks={tasks} taxMessage={taxMessage} onTaxPaid={loadDashboardData} />;
  }

  if (user?.user_type === "professor") {
    return <TeacherDashboard user={user} tasks={tasks} />;
  }

  // Removed the ParentDashboard conditional render
  // if (user?.user_type === "pais") {
  //   return <ParentDashboard user={user} />;
  // }

  return (
      <div className="p-6 h-screen flex items-center justify-center text-center">
          <div>
              <p className="text-gray-600">Não foi possível carregar o dashboard.</p>
              <p className="text-sm text-gray-500">Tente recarregar a página.</p>
          </div>
      </div>
  );
}