
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User";
import { Task } from "@/entities/Task";
import { Award, CheckCircle, XCircle, Eye, FileText, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function GradeTasks() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      if (userData.user_type !== "professor") {
        navigate(createPageUrl("Dashboard"));
        return;
      }

      const submittedTasks = await Task.filter({ 
        teacher_id: userData.id, 
        status: "enviada" 
      }, "-created_date");
      
      setTasks(submittedTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGrade = async (approved) => {
    if (!selectedTask) return;
    
    setGrading(true);
    try {
      const updateData = {
        status: approved ? "aprovada" : "rejeitada",
        feedback: feedback
      };

      await Task.update(selectedTask.id, updateData);

      if (approved) {
        alert(`Tarefa aprovada! O aluno receberá ${selectedTask.coin_reward} moedas e ${selectedTask.xp_reward || 50} XP quando entrar no app.`);
      } else {
        alert("Tarefa rejeitada. Aluno pode refazer.");
      }

      setSelectedTask(null);
      setFeedback("");
      loadData();
    } catch (error) {
      console.error("Erro ao corrigir:", error);
      alert("Erro ao processar correção. Tente novamente.");
    }
    setGrading(false);
  };

  const getStudentName = (studentId) => {
    if (!studentId) return null;
    const studentsList = user?.students_list || [];
    const student = studentsList.find(s => s.student_id === studentId);
    return student ? student.name : null;
  };

  const getStudentInfo = (task) => {
    // Usa submitted_by em vez de created_by
    const studentId = task.submitted_by;
    
    if (!studentId) return "Aluno desconhecido";
    
    const studentName = getStudentName(studentId);
    
    if (studentName) {
      return (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{studentName}</span>
          <span className="text-xs text-gray-500">({studentId.substring(0, 8)}...)</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-blue-500" />
        <span className="text-xs text-gray-600">ID: {studentId.substring(0, 12)}...</span>
      </div>
    );
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
          .neumorphic-input {
            background: #e0e0e0;
            box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
            border: none;
            border-radius: 12px;
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        <div className="neumorphic-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-800">Corrigir Tarefas</h1>
          </div>
          <p className="text-gray-600">
            {tasks.length} {tasks.length === 1 ? "tarefa aguardando" : "tarefas aguardando"} correção
          </p>
        </div>

        {selectedTask ? (
          <div className="neumorphic-card p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTask.title}</h2>
                  <div className="text-sm text-gray-600">
                    {getStudentInfo(selectedTask)}
                  </div>
                </div>
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Aguardando Correção
                </span>
              </div>
              
              <div className="neumorphic-card p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Descrição da Tarefa:</h3>
                <p className="text-gray-700">{selectedTask.description}</p>
              </div>

              <div className="neumorphic-card p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Resposta do Aluno:
                </h3>
                
                {selectedTask.submission_text && (
                  <div className="bg-white p-4 rounded-xl mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedTask.submission_text}</p>
                  </div>
                )}

                {selectedTask.submission_file_url && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <a 
                      href={selectedTask.submission_file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Ver arquivo anexado
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback para o Aluno
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escreva seu feedback aqui..."
                  className="neumorphic-input w-full p-4 min-h-32"
                />
              </div>

              <div className="neumorphic-card p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Ao aprovar, o aluno receberá:
                </p>
                <div className="flex gap-4 mt-2">
                  <span className="text-orange-600 font-bold">🪙 {selectedTask.coin_reward} moedas</span>
                  <span className="text-purple-600 font-bold">⭐ {selectedTask.xp_reward || 50} XP</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setFeedback("");
                  }}
                  className="neumorphic-button px-6 py-4 text-gray-800 font-medium"
                >
                  Voltar
                </button>
                <button
                  onClick={() => handleGrade(false)}
                  disabled={grading}
                  className={`neumorphic-button px-6 py-4 font-medium flex items-center justify-center gap-2 ${
                    grading ? "opacity-50 cursor-not-allowed" : "text-red-800"
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  Rejeitar
                </button>
                <button
                  onClick={() => handleGrade(true)}
                  disabled={grading}
                  className={`neumorphic-button px-6 py-4 font-medium flex items-center justify-center gap-2 ${
                    grading ? "opacity-50 cursor-not-allowed" : "text-green-800"
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="neumorphic-card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                      <div className="text-sm ml-4">
                        {getStudentInfo(task)}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        🪙 {task.coin_reward} moedas
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        ⭐ {task.xp_reward || 50} XP
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                        {task.difficulty}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Enviada pelo aluno
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTask(task)}
                    className="neumorphic-button px-6 py-3 text-gray-800 font-medium ml-4 flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Corrigir
                  </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="neumorphic-card p-12 text-center">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma tarefa para corrigir</h3>
                <p className="text-gray-600">Aguarde envios dos alunos para começar as correções!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
