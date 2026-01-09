
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Medal, Star, Crown, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

export default function Ranking() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState("");
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadRanking();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadRanking(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRanking = async (silent = false, isRetry = false) => {
    if (!silent) setLoading(true);
    if (!isRetry) setError(null);
    
    try {
      console.log("🔄 Carregando ranking...");
      
      // Tentar carregar usuário atual
      let userData = null;
      try {
        userData = await base44.auth.me();
        setCurrentUser(userData);
        console.log("✅ Usuário carregado:", userData.full_name);
      } catch (userError) {
        console.warn("⚠️ Erro ao carregar usuário (pode não estar logado):", userError);
        // Continua mesmo sem usuário logado
      }

      // Buscar entradas de ranking com timeout
      console.log("📊 Buscando entradas do ranking...");
      
      let rankingEntries = [];
      try {
        // Adicionar timeout manual
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout ao buscar ranking (10s)")), 10000)
        );
        
        const fetchPromise = base44.entities.RankingEntry.list("-streak");
        
        rankingEntries = await Promise.race([fetchPromise, timeoutPromise]);
        console.log("✅ Ranking buscado:", rankingEntries.length, "entradas");
      } catch (fetchError) {
        console.error("❌ Erro ao buscar ranking:", fetchError);
        throw new Error("Não foi possível carregar o ranking. Verifique sua conexão e tente novamente.");
      }
      
      // FILTRAR: Apenas usuários com streak > 0
      const filteredEntries = rankingEntries.filter(entry => {
        const hasStreak = (entry.streak || 0) > 0;
        return hasStreak;
      });
      
      console.log("📊 Ranking filtrado:", filteredEntries.length, "estudantes com streak > 0");
      console.log("📊 Ranking atualizado:", filteredEntries.map(e => ({
        nome: e.full_name,
        foguinho: e.streak
      })));
      
      setStudents(filteredEntries);
      setRetryCount(0);
      setError(null);
      
      const today = new Date();
      const monthName = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      setCurrentMonth(monthName);
      
    } catch (error) {
      console.error("❌ Erro ao carregar ranking:", error);
      setError(error.message || "Erro ao carregar ranking");
      
      if (!silent && retryCount < 3) {
        console.log(`🔄 Tentando novamente (${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadRanking(false, true), 2000 * (retryCount + 1)); 
      } else if (!silent) {
        console.log("❌ Limite de tentativas atingido ou modo não silencioso. Exibindo erro e limpando estudantes.");
        setStudents([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setRetryCount(0);
    await loadRanking(false);
    setRefreshing(false);
  };

  // Função para calcular a posição real considerando empates
  const calculatePosition = (index, students) => {
    if (index === 0) return 1;
    
    const currentStreak = students[index].streak;
    const previousStreak = students[index - 1].streak;
    
    if (currentStreak === previousStreak) {
      return calculatePosition(index - 1, students);
    }
    
    return index + 1;
  };

  // Função para pegar os usuários do pódio (considerando empates)
  const getPodiumStudents = () => {
    if (students.length === 0) return { first: [], second: [], third: [] };
    
    const podium = { first: [], second: [], third: [] };
    
    students.forEach((student, index) => {
      const position = calculatePosition(index, students);
      if (position === 1) podium.first.push(student);
      else if (position === 2) podium.second.push(student);
      else if (position === 3) podium.third.push(student);
    });
    
    return podium;
  };

  const getMedalIcon = (position) => {
    if (position === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (position === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (position === 3) return <Medal className="w-8 h-8 text-orange-600" />;
    return <Star className="w-6 h-6 text-gray-400" />;
  };

  const getPositionColor = (position) => {
    if (position === 1) return "bg-gradient-to-br from-yellow-400 to-yellow-600";
    if (position === 2) return "bg-gradient-to-br from-gray-300 to-gray-500";
    if (position === 3) return "bg-gradient-to-br from-orange-400 to-orange-600";
    return "bg-gradient-to-br from-gray-200 to-gray-300";
  };

  const getRankingCardStyle = (position) => {
    if (position === 1) return "border-4 border-yellow-500 shadow-2xl scale-105";
    if (position === 2) return "border-4 border-gray-400 shadow-xl";
    if (position === 3) return "border-4 border-orange-500 shadow-xl";
    return "";
  };

  if (loading) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
             style={{
               boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff"
             }}>
          <div className="animate-spin w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full"></div>
        </div>
        {retryCount > 0 && (
          <p className="text-sm text-gray-600 mt-4 text-center">
            Tentando reconectar... ({retryCount}/3)
          </p>
        )}
      </div>
    );
  }

  const podium = getPodiumStudents();

  return (
    <div className="p-4 md:p-6 min-h-screen">
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
            border-radius: 12px;
            transition: all 0.2s ease;
          }
          .neumorphic-button:hover {
            box-shadow: inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff;
          }
          .neumorphic-button:active {
            box-shadow: inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff;
          }
          .neumorphic-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            box-shadow: inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff;
          }
          @keyframes shine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .shine {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            background-size: 200% 100%;
            animation: shine 2s infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="neumorphic-card p-4 md:p-6 mb-6 bg-red-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 text-center sm:text-left">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Erro ao carregar ranking</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="neumorphic-button px-4 py-2 text-sm font-medium text-red-700 whitespace-nowrap mt-3 sm:mt-0"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="neumorphic-card p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Ranking do Mês</h1>
                <p className="text-sm md:text-base text-gray-600 capitalize">{currentMonth}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="neumorphic-button p-3 md:p-4"
              title="Atualizar ranking"
            >
              <RefreshCw className={`w-5 h-5 md:w-6 md:h-6 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="neumorphic-card p-4 md:p-6 bg-yellow-50">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              <h3 className="text-base md:text-lg font-bold text-yellow-800">Prêmios do Mês</h3>
            </div>
            <p className="text-sm md:text-base text-yellow-700 mb-2">
              <strong>🥇 1º Lugar:</strong> <strong>700 moedas + Certificado 🎓</strong>
            </p>
            <p className="text-sm md:text-base text-yellow-700 mb-2">
              <strong>🥈 2º Lugar:</strong> <strong>500 moedas + Certificado 🎓</strong>
            </p>
            <p className="text-sm md:text-base text-yellow-700 mb-2">
              <strong>🥉 3º Lugar:</strong> <strong>300 moedas + Certificado 🎓</strong>
            </p>
            <p className="text-xs md:text-sm text-yellow-600 mt-3">
              Complete 1 quiz + invista 10+ moedas por dia para aumentar seu foguinho! 🔥
            </p>
            <p className="text-xs md:text-sm text-yellow-600 mt-2">
              ⚠️ Em caso de empate, todos os empatados recebem o prêmio da posição!
            </p>
          </div>
        </div>

        {/* Top 3 Podium - Layout de Pódio Tradicional */}
        {students.length > 0 && (podium.first.length > 0 || podium.second.length > 0 || podium.third.length > 0) && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">🏆 Pódio do Mês 🏆</h2>
            
            {/* Layout de Pódio - Desktop */}
            <div className="hidden md:block">
              <div className="flex items-end justify-center gap-8 max-w-5xl mx-auto mb-12">
                
                {/* 2º Lugar - Esquerda */}
                {podium.second.length > 0 && (
                  <div className="flex-1 max-w-xs">
                    <div className="text-center mb-4">
                      <Medal className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-gray-600">
                        🥈 {podium.second.length > 1 ? `${podium.second.length} Empatados` : '2º Lugar'}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {podium.second.map((student) => (
                        <div key={student.id} className="neumorphic-card p-4 text-center transform hover:scale-105 transition-transform">
                          {student.profile_picture ? (
                            <img 
                              src={student.profile_picture} 
                              alt={student.full_name}
                              className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-4 border-gray-400"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 border-4 border-gray-400">
                              {student.full_name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <h4 className="font-bold text-gray-800 text-sm truncate">{student.full_name}</h4>
                          <p className="text-xl font-bold text-gray-600 mt-1">🔥 {student.streak || 0}</p>
                          <p className="text-xs text-gray-600 font-semibold mt-1">500🪙</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1º Lugar - Centro (Mais Alto) */}
                {podium.first.length > 0 && (
                  <div className="flex-1 max-w-sm">
                    <div className="text-center mb-4">
                      <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-2 float-animation" />
                      <h3 className="text-2xl font-bold text-yellow-600">
                        🥇 {podium.first.length > 1 ? `${podium.first.length} Campeões!` : 'Campeão!'}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {podium.first.map((student) => (
                        <div key={student.id} className="neumorphic-card p-6 text-center relative overflow-hidden transform hover:scale-105 transition-transform border-4 border-yellow-500">
                          <div className="shine absolute inset-0"></div>
                          {student.profile_picture ? (
                            <img 
                              src={student.profile_picture} 
                              alt={student.full_name}
                              className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-yellow-500 relative z-10"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3 border-4 border-yellow-500 relative z-10">
                              {student.full_name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <h4 className="font-bold text-gray-800 text-lg truncate relative z-10">{student.full_name}</h4>
                          <p className="text-3xl font-bold text-yellow-600 mt-2 relative z-10">🔥 {student.streak || 0}</p>
                          <p className="text-sm text-yellow-700 font-bold mt-2 relative z-10">700🪙 + 🎓</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3º Lugar - Direita */}
                {podium.third.length > 0 && (
                  <div className="flex-1 max-w-xs">
                    <div className="text-center mb-4">
                      <Medal className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-orange-600">
                        🥉 {podium.third.length > 1 ? `${podium.third.length} Empatados` : '3º Lugar'}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {podium.third.map((student) => (
                        <div key={student.id} className="neumorphic-card p-4 text-center transform hover:scale-105 transition-transform">
                          {student.profile_picture ? (
                            <img 
                              src={student.profile_picture} 
                              alt={student.full_name}
                              className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-4 border-orange-500"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 border-4 border-orange-500">
                              {student.full_name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <h4 className="font-bold text-gray-800 text-sm truncate">{student.full_name}</h4>
                          <p className="text-xl font-bold text-orange-600 mt-1">🔥 {student.streak || 0}</p>
                          <p className="text-xs text-gray-600 font-semibold mt-1">300🪙</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            {/* Layout Mobile - Vertical */}
            <div className="md:hidden space-y-6">
              
              {/* 1º Lugar - Mobile */}
              {podium.first.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-yellow-600 mb-3 text-center">
                    🥇 {podium.first.length > 1 ? `${podium.first.length} Campeões!` : 'Campeão!'}
                  </h3>
                  <div className="space-y-3">
                    {podium.first.map((student) => (
                      <div key={student.id} className="neumorphic-card p-4 text-center relative overflow-hidden border-4 border-yellow-500">
                        <div className="shine absolute inset-0"></div>
                        <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-2 relative z-10" />
                        {student.profile_picture ? (
                          <img 
                            src={student.profile_picture} 
                            alt={student.full_name}
                            className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-4 border-yellow-500 relative z-10"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 border-4 border-yellow-500 relative z-10">
                            {student.full_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <h3 className="text-sm font-bold text-gray-800 truncate relative z-10">{student.full_name}</h3>
                        <p className="text-xl font-bold text-yellow-600 mt-1 relative z-10">🔥 {student.streak || 0}</p>
                        <p className="text-xs text-yellow-700 font-bold relative z-10">1º • 700🪙</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2º Lugar - Mobile */}
              {podium.second.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-600 mb-3 text-center">
                    🥈 {podium.second.length > 1 ? `${podium.second.length} em 2º Lugar` : '2º Lugar'}
                  </h3>
                  <div className="space-y-3">
                    {podium.second.map((student) => (
                      <div key={student.id} className="neumorphic-card p-4 text-center">
                        <Medal className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        {student.profile_picture ? (
                          <img 
                            src={student.profile_picture} 
                            alt={student.full_name}
                            className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                            {student.full_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <h3 className="text-sm font-bold text-gray-800 truncate">{student.full_name}</h3>
                        <p className="text-lg font-bold text-gray-600 mt-1">🔥 {student.streak || 0}</p>
                        <p className="text-xs text-gray-500">2º • 500🪙</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3º Lugar - Mobile */}
              {podium.third.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-orange-600 mb-3 text-center">
                    🥉 {podium.third.length > 1 ? `${podium.third.length} em 3º Lugar` : '3º Lugar'}
                  </h3>
                  <div className="space-y-3">
                    {podium.third.map((student) => (
                      <div key={student.id} className="neumorphic-card p-4 text-center">
                        <Medal className="w-10 h-10 text-orange-600 mx-auto mb-2" />
                        {student.profile_picture ? (
                          <img 
                            src={student.profile_picture} 
                            alt={student.full_name}
                            className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                            {student.full_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <h3 className="text-sm font-bold text-gray-800 truncate">{student.full_name}</h3>
                        <p className="text-lg font-bold text-orange-600 mt-1">🔥 {student.streak || 0}</p>
                        <p className="text-xs text-gray-500">3º • 300🪙</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}

        {/* Full Ranking List */}
        <div className="neumorphic-card p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Ranking Completo
          </h2>
          
          <div className="space-y-3">
            {students.map((student, index) => {
              const position = calculatePosition(index, students);
              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-200 rounded-xl transition-all ${
                    student.user_id === currentUser?.id ? "ring-2 ring-blue-500" : ""
                  } ${getRankingCardStyle(position)}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${getPositionColor(position)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {position <= 3 ? getMedalIcon(position) : position}
                  </div>

                  {student.profile_picture ? (
                    <img 
                      src={student.profile_picture} 
                      alt={student.full_name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                      {student.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-gray-800 truncate">
                      {student.full_name}
                      {student.user_id === currentUser?.id && (
                        <span className="text-xs md:text-sm text-blue-600 ml-2">(Você)</span>
                      )}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Nível {student.level || 1} • {(student.coins_balance || 0).toFixed(2)} moedas
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl md:text-2xl font-bold text-red-500">🔥 {student.streak || 0}</p>
                    <p className="text-xs text-gray-600">{position}º lugar</p>
                  </div>
                </div>
              );
            })}
          </div>

          {students.length === 0 && !error && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum estudante no ranking</h3>
              <p className="text-gray-600">Complete quizzes e invista para aparecer no ranking!</p>
              <p className="text-sm text-gray-500 mt-2">É necessário ter pelo menos 1 foguinho para aparecer aqui.</p>
            </div>
          )}
          
          {students.length === 0 && error && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">Falha ao carregar Ranking</h3>
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Por favor, tente recarregar ou verifique sua conexão.</p>
              <button
                onClick={handleRefresh}
                className="neumorphic-button px-6 py-3 text-base font-medium text-red-700 mt-4"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
