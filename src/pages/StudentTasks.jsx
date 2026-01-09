
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Task } from "@/entities/Task";
import { UploadFile } from "@/integrations/Core";
import { BookOpen, Upload, Clock, CheckCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function StudentTasks() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Buscar TODAS as tarefas
      const allTasks = await base44.entities.Task.list("-created_date");
      
      console.log("Total de tarefas no sistema:", allTasks.length);
      console.log("ID do usuário:", userData.id);
      
      // Filtrar para mostrar apenas:
      // 1. Tarefas para todos (student_id vazio ou null)
      // 2. Tarefas específicas para este aluno (student_id = user.id)
      const myTasks = allTasks.filter(task => {
        const isForEveryone = !task.student_id || task.student_id === "";
        const isForMe = task.student_id === userData.id;
        const shouldShow = isForEveryone || isForMe;
        
        if (shouldShow) {
          console.log(`Tarefa "${task.title}" - student_id: ${task.student_id}, isForEveryone: ${isForEveryone}, isForMe: ${isForMe}`);
        }
        
        return shouldShow;
      });
      
      console.log("Minhas tarefas:", myTasks.length);
      setTasks(myTasks);

      // Marcar tarefas pendentes como visualizadas
      const pendingTasks = myTasks.filter(t => t.status === "pendente" && !t.viewed_by_student);
      console.log("Tarefas pendentes não visualizadas:", pendingTasks.length);
      
      for (const task of pendingTasks) {
        await base44.entities.Task.update(task.id, { viewed_by_student: true });
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubmissionFile(file);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || (!submissionText && !submissionFile)) return;
    // Ensure user is loaded before attempting to submit
    if (!user) {
      console.error("User data not loaded yet.");
      return;
    }
    
    setUploading(true);
    try {
      let fileUrl = "";
      if (submissionFile) {
        const result = await UploadFile({ file: submissionFile });
        fileUrl = result.file_url;
      }

      await Task.update(selectedTask.id, {
        status: "enviada",
        submission_text: submissionText,
        submission_file_url: fileUrl,
        submitted_by: user.id
      });

      setSelectedTask(null);
      setSubmissionText("");
      setSubmissionFile(null);
      loadData();
    } catch (error) {
      console.error("Erro ao enviar tarefa:", error);
    }
    setUploading(false);
  };

  const getCategoryColor = (difficulty) => {
    const colors = {
      iniciante: "bg-green-100 text-green-800",
      intermediario: "bg-yellow-100 text-yellow-800",
      avancado: "bg-red-100 text-red-800"
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
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

      <div className="max-w-5xl mx-auto">
        <div className="neumorphic-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-800">Minhas Tarefas</h1>
          </div>
          <p className="text-gray-600">
            Complete as tarefas para ganhar moedas e melhorar seu inglês!
          </p>
        </div>

        {selectedTask ? (
          <div className="neumorphic-card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTask.title}</h2>
              <div className="flex gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getCategoryColor(selectedTask.difficulty)}`}>
                  {selectedTask.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  🪙 {selectedTask.coin_reward} moedas
                </span>
              </div>
              <p className="text-gray-700 mb-6">{selectedTask.description}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua Resposta
                </label>
                <Textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="neumorphic-input w-full p-4 min-h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexar Arquivo (Opcional)
                </label>
                <div className="neumorphic-card p-4">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full"
                  />
                  {submissionFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Arquivo selecionado: {submissionFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setSubmissionText("");
                  setSubmissionFile(null);
                }}
                className="neumorphic-button px-6 py-3 text-gray-800 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitTask}
                disabled={uploading || (!submissionText && !submissionFile) || !user}
                className={`neumorphic-button px-6 py-3 font-medium ${
                  uploading || (!submissionText && !submissionFile) || !user
                    ? "opacity-50 cursor-not-allowed"
                    : "text-green-800"
                }`}
              >
                {uploading ? "Enviando..." : "Enviar Tarefa"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="neumorphic-card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h3>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getCategoryColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        🪙 {task.coin_reward} moedas
                      </span>
                      {task.status === "pendente" && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Pendente
                        </span>
                      )}
                      {task.status === "enviada" && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Upload className="w-4 h-4" /> Enviada
                        </span>
                      )}
                      {task.status === "aprovada" && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Aprovada {task.credited && "✅"}
                        </span>
                      )}
                      {task.status === "rejeitada" && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Refazer
                        </span>
                      )}
                    </div>
                  </div>

                  {(task.status === "pendente" || task.status === "rejeitada") && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="neumorphic-button px-6 py-2 text-gray-800 font-medium ml-4"
                    >
                      Fazer Tarefa
                    </button>
                  )}
                </div>

                {task.feedback && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm font-medium text-blue-800 mb-1">Feedback do Professor:</p>
                    <p className="text-blue-700">{task.feedback}</p>
                  </div>
                )}
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="neumorphic-card p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma tarefa disponível</h3>
                <p className="text-gray-600">Aguarde novas tarefas do seu professor!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
