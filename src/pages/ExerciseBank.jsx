
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User";
import { Task } from "@/entities/Task";
import { Library, Plus, BookOpen } from "lucide-react";

export default function ExerciseBank() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("todos");
  const [assigning, setAssigning] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      if (userData.user_type !== "professor") {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]); // navigate is a dependency because it's used inside loadUser

  useEffect(() => {
    loadUser();
  }, [loadUser]); // loadUser is a dependency because it's called inside useEffect

  const exercises = [
    // Iniciante
    {
      id: 1,
      title: "Verb to Be - Presente",
      description: "Complete as frases usando 'am', 'is' ou 'are'",
      difficulty: "iniciante",
      topic: "verb_to_be",
      coin_reward: 10
    },
    {
      id: 2,
      title: "Números de 1 a 100",
      description: "Escreva os números por extenso em inglês",
      difficulty: "iniciante",
      topic: "numbers",
      coin_reward: 10
    },
    {
      id: 3,
      title: "Cores em Inglês",
      description: "Identifique as cores e complete os exercícios",
      difficulty: "iniciante",
      topic: "colors",
      coin_reward: 10
    },
    {
      id: 4,
      title: "Saudações e Apresentações",
      description: "Aprenda cumprimentos formais e informais",
      difficulty: "iniciante",
      topic: "greetings",
      coin_reward: 15
    },
    // Intermediário
    {
      id: 5,
      title: "Past Simple - Verbos Regulares",
      description: "Conjugue verbos no passado simples",
      difficulty: "intermediario",
      topic: "past_tense",
      coin_reward: 20
    },
    {
      id: 6,
      title: "Phrasal Verbs Comuns",
      description: "Aprenda 20 phrasal verbs essenciais",
      difficulty: "intermediario",
      topic: "phrasal_verbs",
      coin_reward: 25
    },
    {
      id: 7,
      title: "Modal Verbs: Can, Could, Should",
      description: "Pratique o uso de verbos modais",
      difficulty: "intermediario",
      topic: "modal_verbs",
      coin_reward: 20
    },
    {
      id: 8,
      title: "Conversação Prática",
      description: "Diálogos do dia-a-dia em inglês",
      difficulty: "intermediario",
      topic: "conversation",
      coin_reward: 25
    },
    {
      id: 9,
      title: "Present Perfect vs Past Simple",
      description: "Entenda a diferença entre os dois tempos verbais",
      difficulty: "intermediario",
      topic: "past_tense",
      coin_reward: 25
    },
    // Avançado
    {
      id: 10,
      title: "Redação Argumentativa",
      description: "Escreva um texto argumentativo de 200 palavras",
      difficulty: "avancado",
      topic: "writing",
      coin_reward: 35
    },
    {
      id: 11,
      title: "Inglês para Negócios",
      description: "Vocabulário e expressões do mundo corporativo",
      difficulty: "avancado",
      topic: "business_english",
      coin_reward: 30
    },
    {
      id: 12,
      title: "Escrita Acadêmica",
      description: "Estrutura de artigos e ensaios acadêmicos",
      difficulty: "avancado",
      topic: "academic_writing",
      coin_reward: 40
    },
    {
      id: 13,
      title: "Conditional Sentences (All Types)",
      description: "Domine as estruturas condicionais",
      difficulty: "avancado",
      topic: "modal_verbs",
      coin_reward: 35
    },
    {
      id: 14,
      title: "Advanced Phrasal Verbs",
      description: "Phrasal verbs para nível avançado",
      difficulty: "avancado",
      topic: "phrasal_verbs",
      coin_reward: 30
    }
  ];

  const handleAssignExercise = async (exercise) => {
    setAssigning(true);
    try {
      await Task.create({
        title: exercise.title,
        description: exercise.description,
        english_topic: exercise.topic,
        difficulty: exercise.difficulty,
        coin_reward: exercise.coin_reward,
        teacher_id: user.id,
        status: "pendente",
        is_template: true
      });

      alert("Exercício atribuído com sucesso aos alunos!");
    } catch (error) {
      console.error("Erro ao atribuir exercício:", error);
      alert("Erro ao atribuir exercício. Tente novamente.");
    }
    setAssigning(false);
  };

  const filteredExercises = selectedLevel === "todos" 
    ? exercises 
    : exercises.filter(ex => ex.difficulty === selectedLevel);

  const getLevelColor = (difficulty) => {
    const colors = {
      iniciante: "bg-green-100 text-green-800",
      intermediario: "bg-yellow-100 text-yellow-800",
      avancado: "bg-red-100 text-red-800"
    };
    return colors[difficulty];
  };

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

  return (
    <div className="p-6">
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
          .neumorphic-pressed {
            background: #e0e0e0;
            box-shadow: inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff;
            border-radius: 15px;
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        <div className="neumorphic-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Library className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-800">Banco de Exercícios</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Mais de 50 exercícios prontos para usar com seus alunos
          </p>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedLevel("todos")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedLevel === "todos" 
                  ? "neumorphic-pressed text-blue-700" 
                  : "neumorphic-button text-gray-700"
              }`}
            >
              Todos ({exercises.length})
            </button>
            <button
              onClick={() => setSelectedLevel("iniciante")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedLevel === "iniciante" 
                  ? "neumorphic-pressed text-green-700" 
                  : "neumorphic-button text-gray-700"
              }`}
            >
              Iniciante ({exercises.filter(e => e.difficulty === "iniciante").length})
            </button>
            <button
              onClick={() => setSelectedLevel("intermediario")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedLevel === "intermediario" 
                  ? "neumorphic-pressed text-yellow-700" 
                  : "neumorphic-button text-gray-700"
              }`}
            >
              Intermediário ({exercises.filter(e => e.difficulty === "intermediario").length})
            </button>
            <button
              onClick={() => setSelectedLevel("avancado")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedLevel === "avancado" 
                  ? "neumorphic-pressed text-red-700" 
                  : "neumorphic-button text-gray-700"
              }`}
            >
              Avançado ({exercises.filter(e => e.difficulty === "avancado").length})
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="neumorphic-card p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{exercise.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getLevelColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    🪙 {exercise.coin_reward}
                  </span>
                </div>

                <button
                  onClick={() => handleAssignExercise(exercise)}
                  disabled={assigning}
                  className={`neumorphic-button px-6 py-2 font-medium flex items-center gap-2 ${
                    assigning ? "opacity-50 cursor-not-allowed" : "text-blue-700"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Atribuir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
