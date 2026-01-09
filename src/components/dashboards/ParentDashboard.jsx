import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, Calendar, Star
} from "lucide-react";

export default function ParentDashboard({ user }) {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="neumorphic-card p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Olá, {user.full_name}! 👨‍👩‍👧
          </h1>
          <p className="text-gray-600 mb-6">
            Acompanhe o progresso e evolução dos seus filhos
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="neumorphic-card p-6 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-2xl font-bold text-blue-500 mb-1">
                {(user.students || []).length}
              </h3>
              <p className="text-gray-600 text-sm">Filhos Cadastrados</p>
            </div>
            
            <div className="neumorphic-card p-6 text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-2xl font-bold text-green-500 mb-1">
                85%
              </h3>
              <p className="text-gray-600 text-sm">Progresso Médio</p>
            </div>
            
            <div className="neumorphic-card p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-2xl font-bold text-purple-500 mb-1">
                12
              </h3>
              <p className="text-gray-600 text-sm">Metas Cumpridas</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="neumorphic-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Acompanhamento</h2>
            <div className="space-y-3">
              <Link
                to={createPageUrl("StudentProgress")}
                className="neumorphic-button p-4 flex items-center gap-3 text-gray-800 transition-all w-full text-left"
              >
                <TrendingUp className="w-6 h-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">Progresso dos Filhos</h3>
                  <p className="text-sm text-gray-600">Evolução semanal/mensal</p>
                </div>
              </Link>
              
              <Link
                to={createPageUrl("StudentHistory")}
                className="neumorphic-button p-4 flex items-center gap-3 text-gray-800 transition-all w-full text-left"
              >
                <Calendar className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Histórico Completo</h3>
                  <p className="text-sm text-gray-600">Tarefas e conquistas</p>
                </div>
              </Link>
              
              <button className="neumorphic-button p-4 flex items-center gap-3 text-gray-800 transition-all w-full text-left">
                <Star className="w-6 h-6 text-yellow-500" />
                <div>
                  <h3 className="font-semibold">Notificações</h3>
                  <p className="text-sm text-gray-600">Configurar alertas</p>
                </div>
              </button>
            </div>
          </div>

          <div className="neumorphic-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Última Semana</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-100 rounded-xl">
                <h3 className="font-medium text-green-800">🎉 Parabéns!</h3>
                <p className="text-sm text-green-600">
                  Seu filho completou 5 tarefas esta semana
                </p>
              </div>
              
              <div className="p-4 bg-blue-100 rounded-xl">
                <h3 className="font-medium text-blue-800">💰 Nova Recompensa</h3>
                <p className="text-sm text-blue-600">
                  Resgatou uma caneca com 150 moedas
                </p>
              </div>
              
              <div className="p-4 bg-purple-100 rounded-xl">
                <h3 className="font-medium text-purple-800">📈 Progresso</h3>
                <p className="text-sm text-purple-600">
                  Nível de inglês melhorou em 15%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}