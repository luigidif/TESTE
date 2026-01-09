import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, Award, Users
} from "lucide-react";

export default function TeacherDashboard({ user, tasks }) {
  const pendingGrading = tasks.filter(t => t.status === "enviada").length;
  const totalTasks = tasks.length;
  const totalStudents = (user.students_list || []).length;

  const recentTasks = tasks.filter(t => t.status === "enviada" || t.status === "aprovada" || t.status === "rejeitada").slice(0, 5);

  const getStatusColor = (status) => {
    if (status === "aprovada") return "bg-green-500";
    if (status === "rejeitada") return "bg-red-500";
    if (status === "enviada") return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getStatusText = (status) => {
    if (status === "aprovada") return "Aprovada";
    if (status === "rejeitada") return "Rejeitada";
    if (status === "enviada") return "Aguardando";
    return "Pendente";
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="neumorphic-card p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo, Prof. {user.full_name}! 👨‍🏫
          </h1>
          <p className="text-gray-600 mb-6">
            Painel do professor para gerenciar tarefas e acompanhar alunos
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="neumorphic-card p-6 text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-2xl font-bold text-blue-500 mb-1">
                {pendingGrading}
              </h3>
              <p className="text-gray-600 text-sm">Para Corrigir</p>
            </div>
            
            <div className="neumorphic-card p-6 text-center">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-2xl font-bold text-green-500 mb-1">
                {totalTasks}
              </h3>
              <p className="text-gray-600 text-sm">Total de Tarefas</p>
            </div>
            
            <div className="neumorphic-card p-6 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-2xl font-bold text-purple-500 mb-1">
                {totalStudents}
              </h3>
              <p className="text-gray-600 text-sm">Alunos</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="neumorphic-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link
                to={createPageUrl("CreateTask")}
                className="neumorphic-button p-4 flex items-center gap-3 text-gray-800 transition-all w-full text-left"
              >
                <BookOpen className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Criar Tarefa</h3>
                  <p className="text-sm text-gray-600">Nova tarefa personalizada</p>
                </div>
              </Link>
              
              <Link
                to={createPageUrl("GradeTasks")}
                className="neumorphic-button p-4 flex items-center gap-3 text-gray-800 transition-all w-full text-left"
              >
                <Award className="w-6 h-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">Corrigir Tarefas</h3>
                  <p className="text-sm text-gray-600">{pendingGrading} aguardando</p>
                </div>
              </Link>
              
              <Link
                to={createPageUrl("StudentsList")}
                className="neumorphic-button p-4 flex items-center gap-3 text-gray-800 transition-all w-full text-left"
              >
                <Users className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="font-semibold">Meus Alunos</h3>
                  <p className="text-sm text-gray-600">{totalStudents} alunos cadastrados</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="neumorphic-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tarefas Recentes</h2>

            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-200 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600">
                      {getStatusText(task.status)} • {task.coin_reward} moedas
                    </p>
                  </div>
                  {task.status === "enviada" && (
                    <Link
                      to={createPageUrl("GradeTasks")}
                      className="neumorphic-button px-3 py-1 text-sm font-medium text-gray-800"
                    >
                      Corrigir
                    </Link>
                  )}
                </div>
              ))}
              
              {recentTasks.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma tarefa recente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}