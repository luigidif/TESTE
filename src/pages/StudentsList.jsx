
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User";
import { Users, Copy, Check, UserPlus, Trash2, Edit2, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudentsList() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    student_id: ""
  });

  const loadData = useCallback(async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      if (userData.user_type !== "professor") {
        navigate(createPageUrl("Dashboard"));
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddStudent = async () => {
    if (!formData.name.trim() || !formData.student_id.trim()) {
      alert("Preencha pelo menos o nome e o ID do aluno!");
      return;
    }

    const studentsList = user.students_list || [];
    
    // Verificar se o ID já existe (apenas ao adicionar novo, não ao editar)
    if (editingIndex === null) {
      const idExists = studentsList.some(student => student.student_id === formData.student_id.trim());
      if (idExists) {
        alert("⚠️ Este aluno já está cadastrado na sua planilha!");
        return;
      }
    }
    
    if (editingIndex !== null) {
      // Editando aluno existente
      studentsList[editingIndex] = {
        name: formData.name.trim(),
        grade: formData.grade.trim(),
        student_id: formData.student_id.trim()
      };
    } else {
      // Adicionando novo aluno
      studentsList.push({
        name: formData.name.trim(),
        grade: formData.grade.trim(),
        student_id: formData.student_id.trim()
      });
    }

    try {
      await UserEntity.updateMyUserData({ students_list: studentsList });
      alert(editingIndex !== null ? "Aluno atualizado com sucesso!" : "Aluno adicionado com sucesso!");
      setFormData({ name: "", grade: "", student_id: "" });
      setShowAddForm(false);
      setEditingIndex(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      alert("Erro ao salvar aluno. Tente novamente.");
    }
  };

  const handleEditStudent = (index) => {
    const student = user.students_list[index];
    setFormData({
      name: student.name,
      grade: student.grade || "",
      student_id: student.student_id
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleRemoveStudent = async (index) => {
    if (!window.confirm("Tem certeza que deseja remover este aluno da lista?")) {
      return;
    }

    const studentsList = [...(user.students_list || [])];
    studentsList.splice(index, 1);

    try {
      await UserEntity.updateMyUserData({ students_list: studentsList });
      alert("Aluno removido com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao remover aluno:", error);
      alert("Erro ao remover aluno. Tente novamente.");
    }
  };

  const cancelForm = () => {
    setFormData({ name: "", grade: "", student_id: "" });
    setShowAddForm(false);
    setEditingIndex(null);
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

  const studentsList = user?.students_list || [];

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-800">Planilha de Alunos</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="neumorphic-button px-6 py-3 text-gray-800 font-medium flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Adicionar Aluno
            </button>
          </div>
          <p className="text-gray-600">
            Gerencie seus alunos e copie os IDs para criar tarefas individuais
          </p>
        </div>

        {showAddForm && (
          <div className="neumorphic-card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingIndex !== null ? "Editar Aluno" : "Adicionar Novo Aluno"}
              </h2>
              <button
                onClick={cancelForm}
                className="neumorphic-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Aluno *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="neumorphic-input w-full p-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Série/Ano
                </label>
                <Input
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="Ex: 5º ano"
                  className="neumorphic-input w-full p-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Aluno *
                </label>
                <Input
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="Cole o ID do aluno aqui"
                  className="neumorphic-input w-full p-4"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Peça ao aluno para acessar o Perfil e copiar o ID que aparece lá
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelForm}
                  className="neumorphic-button px-6 py-3 text-gray-800 font-medium flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddStudent}
                  className="neumorphic-button px-6 py-3 text-green-800 font-medium flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingIndex !== null ? "Salvar Alterações" : "Adicionar Aluno"}
                </button>
              </div>
            </div>
          </div>
        )}

        {studentsList.length > 0 ? (
          <div className="neumorphic-card p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-400">
                    <th className="text-left p-4 text-gray-800 font-bold">Nome do Aluno</th>
                    <th className="text-left p-4 text-gray-800 font-bold">Série/Ano</th>
                    <th className="text-left p-4 text-gray-800 font-bold">ID do Aluno</th>
                    <th className="text-right p-4 text-gray-800 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map((student, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="p-4">
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600">{student.grade || "—"}</span>
                      </td>
                      <td className="p-4">
                        <code className="text-sm font-mono bg-gray-300 px-3 py-1 rounded">
                          {student.student_id}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(student.student_id)}
                            className="neumorphic-button p-2"
                            title="Copiar ID"
                          >
                            {copiedId === student.student_id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditStudent(index)}
                            className="neumorphic-button p-2"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleRemoveStudent(index)}
                            className="neumorphic-button p-2"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="neumorphic-card p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum aluno cadastrado</h3>
            <p className="text-gray-600 mb-6">
              Adicione seus alunos para organizar melhor suas tarefas
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="neumorphic-button px-6 py-3 text-gray-800 font-medium inline-flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Adicionar Primeiro Aluno
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
