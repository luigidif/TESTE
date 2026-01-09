
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserEntity } from "@/entities/User";
// Keep this import as per outline, it might be used for type definitions or other contexts not shown.
import { base44 } from "@/api/base44Client"; // New import
import { Plus, Users, Info, X, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateTask() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    english_topic: "verb_to_be",
    difficulty: "iniciante",
    coin_reward: 10,
    xp_reward: 50,
    due_date: "",
    student_ids: []
  });
  const [currentIdInput, setCurrentIdInput] = useState("");

  const loadUser = useCallback(async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      if (userData.user_type !== "professor") {
        navigate(createPageUrl("Dashboard"));
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const addStudentId = () => {
    const trimmedId = currentIdInput.trim();
    if (trimmedId && !formData.student_ids.includes(trimmedId)) {
      setFormData({
        ...formData,
        student_ids: [...formData.student_ids, trimmedId]
      });
      setCurrentIdInput("");
    }
  };

  const removeStudentId = (idToRemove) => {
    setFormData({
      ...formData,
      student_ids: formData.student_ids.filter(id => id !== idToRemove)
    });
  };

  const addStudentFromList = (student) => {
    if (!formData.student_ids.includes(student.student_id)) {
      setFormData({
        ...formData,
        student_ids: [...formData.student_ids, student.student_id]
      });
    }
  };

  const selectAllStudents = () => {
    const studentsList = user?.students_list || [];
    const allStudentIds = studentsList.map(s => s.student_id);
    setFormData({
      ...formData,
      student_ids: allStudentIds
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (formData.student_ids.length === 0) {
        alert("Adicione pelo menos um ID de aluno!");
        setSaving(false);
        return;
      }

      // Criar uma tarefa para cada aluno específico
      const tasksCreated = [];
      for (const studentId of formData.student_ids) {
        const taskData = {
          title: formData.title,
          description: formData.description,
          english_topic: formData.english_topic,
          difficulty: formData.difficulty,
          coin_reward: formData.coin_reward,
          xp_reward: formData.xp_reward,
          due_date: formData.due_date,
          teacher_id: user.id,
          status: "pendente",
          student_id: studentId,
          viewed_by_student: false
        };

        console.log("Criando tarefa:", taskData);
        const createdTask = await base44.entities.Task.create(taskData); // Modified line
        console.log("Tarefa criada com ID:", createdTask.id);
        tasksCreated.push(createdTask);
      }

      console.log(`${tasksCreated.length} tarefas criadas com sucesso!`);
      alert(`✅ Tarefa criada para ${formData.student_ids.length} aluno(s)!\n\nOs alunos receberão uma notificação quando entrarem no app.`);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      alert("Erro ao criar tarefa. Tente novamente.");
    }
    setSaving(false);
  };

  const topics = [
    { value: "verb_to_be", label: "Verb to Be" },
    { value: "numbers", label: "Números" },
    { value: "colors", label: "Cores" },
    { value: "greetings", label: "Saudações" },
    { value: "past_tense", label: "Past Tense" },
    { value: "phrasal_verbs", label: "Phrasal Verbs" },
    { value: "modal_verbs", label: "Modal Verbs" },
    { value: "conversation", label: "Conversação" },
    { value: "writing", label: "Redação" },
    { value: "business_english", label: "Inglês para Negócios" },
    { value: "academic_writing", label: "Escrita Acadêmica" }
  ];

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
          .neumorphic-pressed {
            background: #e0e0e0;
            box-shadow: inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff;
            border-radius: 15px;
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto">
        <div className="neumorphic-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800">Criar Nova Tarefa</h1>
          </div>
          <p className="text-gray-600">
            Crie exercícios personalizados para seus alunos
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="neumorphic-card p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Tarefa *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Exercício sobre Verb to Be"
                className="neumorphic-input w-full p-4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o exercício em detalhes..."
                className="neumorphic-input w-full p-4 min-h-32"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tópico de Inglês
                </label>
                <Select
                  value={formData.english_topic}
                  onValueChange={(value) => setFormData({ ...formData, english_topic: value })}
                >
                  <SelectTrigger className="neumorphic-input w-full p-4">
                    <SelectValue placeholder="Selecione o tópico" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.value} value={topic.value}>
                        {topic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Dificuldade
                </label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger className="neumorphic-input w-full p-4">
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recompensa em Moedas *
                </label>
                <Input
                  type="number"
                  value={formData.coin_reward}
                  onChange={(e) => setFormData({ ...formData, coin_reward: parseInt(e.target.value)})}
                  placeholder="10"
                  min="1"
                  className="neumorphic-input w-full p-4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pontos de XP *
                </label>
                <Input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value)})}
                  placeholder="50"
                  min="1"
                  className="neumorphic-input w-full p-4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Entrega
                </label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="neumorphic-input w-full p-4"
                />
              </div>
            </div>

            <div className="neumorphic-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-gray-800">Atribuir Tarefa para Alunos Específicos</h3>
                </div>
                {studentsList.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="neumorphic-button px-4 py-2 text-sm font-medium text-gray-800 flex items-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Selecionar Todos
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Lista de alunos salvos */}
                {studentsList.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Selecione da sua planilha:</p>
                    <div className="flex flex-wrap gap-2">
                      {studentsList.map((student, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => addStudentFromList(student)}
                          className="neumorphic-button px-3 py-2 text-sm text-gray-700 hover:text-blue-700"
                          disabled={formData.student_ids.includes(student.student_id)}
                        >
                          {student.name} {student.grade && `(${student.grade})`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input para adicionar IDs manualmente */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Ou adicione IDs manualmente:</p>
                  <div className="flex gap-2">
                    <Input
                      value={currentIdInput}
                      onChange={(e) => setCurrentIdInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addStudentId();
                        }
                      }}
                      placeholder="Cole o ID do aluno aqui"
                      className="neumorphic-input flex-1 p-3"
                    />
                    <button
                      type="button"
                      onClick={addStudentId}
                      className="neumorphic-button px-6 py-3 text-gray-800 font-medium"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* IDs adicionados */}
                {formData.student_ids.length > 0 && (
                  <div className="neumorphic-card p-4 bg-purple-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Alunos selecionados ({formData.student_ids.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.student_ids.map((id, idx) => {
                        const student = studentsList.find(s => s.student_id === id);
                        return (
                          <div
                            key={idx}
                            className="bg-white px-3 py-2 rounded-lg flex items-center gap-2"
                          >
                            <span className="text-sm text-gray-800">
                              {student ? `${student.name}` : id.substring(0, 8) + "..."}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeStudentId(id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Adicione os IDs dos alunos que devem receber esta tarefa. Você pode selecionar da sua planilha, usar o botão "Selecionar Todos" ou colar IDs manualmente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="neumorphic-button px-8 py-4 text-gray-800 font-medium flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || formData.student_ids.length === 0}
                className={`neumorphic-button px-8 py-4 font-medium flex-1 ${
                  saving || formData.student_ids.length === 0 ? "opacity-50 cursor-not-allowed" : "text-green-800"
                }`}
              >
                {saving ? "Criando..." : "Criar Tarefa"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
