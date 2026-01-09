
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Mail, Calendar, Award, Edit2, Save, Upload, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    grade: ""
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        grade: userData.grade || ""
      });
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // REMOVIDO: Validação de full_name, pois não é mais editável.
    setSaving(true);
    try {
      const updateData = {
        // REMOVIDO: full_name não é mais editável, então não é enviado no update.
        phone: formData.phone.trim()
      };
      
      if (user.user_type === "estudante" && formData.grade) {
        updateData.grade = formData.grade.trim();
      }
      
      console.log("Enviando dados:", updateData);
      
      await base44.auth.updateMe(updateData);
      
      // REMOVIDO: Atualização de RankingEntry com full_name, pois full_name não é mais editável.
      // A atualização da profile_picture para RankingEntry é tratada em handlePhotoUpload.
      
      setEditing(false);
      alert("✅ Perfil atualizado com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("❌ Erro ao salvar perfil. Tente novamente.");
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file: file });
      await base44.auth.updateMe({ profile_picture: result.file_url });
      
      if (user.user_type === "estudante") {
        const rankingEntries = await base44.entities.RankingEntry.filter({ user_id: user.id });
        
        if (rankingEntries.length > 0) {
          await base44.entities.RankingEntry.update(rankingEntries[0].id, {
            profile_picture: result.file_url,
            // REMOVIDO: full_name não é mais editável, então não é atualizado aqui.
            // full_name: user.full_name // Esta linha foi removida
          });
        }
      }
      
      alert("✅ Foto de perfil atualizada!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("❌ Erro ao atualizar foto. Tente novamente.");
    }
    setUploadingPhoto(false);
  };

  const copyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const calculateProgress = () => {
    if (!user || !user.xp_points) return 0;
    const currentLevelXP = (user.level - 1) * 500;
    const nextLevelXP = user.level * 500;
    const progressXP = user.xp_points - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    if (levelRange <= 0) return 0;
    return (progressXP / levelRange) * 100;
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
    <div className="p-4 md:p-6">
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

      <div className="max-w-4xl mx-auto">
        <div className="neumorphic-card p-4 md:p-8 mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-4 w-full md:w-auto">
              <div className="relative">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt="Perfil" 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl md:text-4xl text-white font-bold">
                      {user?.full_name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{user?.full_name || "Usuário"}</h1>
                <p className="text-gray-600 capitalize">{user?.user_type}</p>
              </div>
            </div>
            
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="hidden md:flex neumorphic-button px-6 py-3 text-gray-800 font-medium items-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                Editar Perfil
              </button>
            )}
          </div>

          <div className="neumorphic-card p-4 md:p-6 mb-4 md:mb-6 bg-blue-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-2 text-center md:text-left">🆔 Seu ID de Usuário</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3 text-center md:text-left">
                  {user?.user_type === "estudante" 
                    ? "Compartilhe este ID com seu professor para receber tarefas individuais"
                    : "Este é o seu identificador único no sistema"}
                </p>
                <div className="flex justify-center md:justify-start">
                  <code className="text-xs md:text-sm font-mono bg-white px-3 md:px-4 py-2 rounded-lg inline-block break-all">
                    {user?.id}
                  </code>
                </div>
              </div>
              <button
                onClick={copyId}
                className="neumorphic-button px-4 md:px-6 py-3 text-gray-800 font-medium flex items-center justify-center gap-2 w-full md:w-auto"
              >
                {copiedId ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copiar ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="md:hidden neumorphic-button w-full px-6 py-3 text-gray-800 font-medium flex items-center justify-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              Editar Perfil
            </button>
          )}

          {user?.user_type === "estudante" && (
            <div className="space-y-4 md:space-y-6 mt-4 md:mt-0">
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="neumorphic-card p-3 md:p-6 text-center">
                  <div className="text-2xl md:text-3xl mb-2">🪙</div>
                  <h3 className="text-lg md:text-2xl font-bold text-orange-500">{(user.coins_balance || 0).toFixed(2)}</h3>
                  <p className="text-xs md:text-sm text-gray-600">Moedas</p>
                </div>

                <div className="neumorphic-card p-3 md:p-6 text-center">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800">Nível {user.level || 1}</h3>
                  <p className="text-xs md:text-sm text-gray-600">Nível Atual</p>
                </div>
              </div>

              <div className="neumorphic-card p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm md:text-base font-bold text-gray-800">Progresso para Nível {(user.level || 1) + 1}</span>
                  <span className="text-xs md:text-sm text-gray-600">{Math.floor(calculateProgress())}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 md:h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 md:h-4 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {user.xp_points || 0} / {(user.level || 1) * 500} XP
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="neumorphic-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-800">Email</h3>
            </div>
            <p className="text-sm md:text-base text-gray-700 ml-8">{user?.email}</p>
          </div>

          <div className="neumorphic-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-800">Nome Completo</h3>
            </div>
            {/* REMOVIDO: Campo de edição do nome - agora apenas visualização */}
            <p className="text-sm md:text-base text-gray-700 ml-8">{user?.full_name || "Não informado"}</p>
          </div>

          <div className="neumorphic-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-800">Telefone</h3>
            </div>
            {editing ? (
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
                className="neumorphic-input ml-8 p-3"
              />
            ) : (
              <p className="text-sm md:text-base text-gray-700 ml-8">{user?.phone || "Não informado"}</p>
            )}
          </div>

          {user?.user_type === "estudante" && (
            <div className="neumorphic-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-800">Série/Ano Escolar</h3>
              </div>
              {editing ? (
                <Input
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  placeholder="Ex: 5º ano"
                  className="neumorphic-input ml-8 p-3"
                />
              ) : (
                <p className="text-sm md:text-base text-gray-700 ml-8">{user?.grade || "Não informado"}</p>
              )}
            </div>
          )}

          <div className="neumorphic-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-800">Membro desde</h3>
            </div>
            <p className="text-sm md:text-base text-gray-700 ml-8">
              {new Date(user?.created_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {editing && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  full_name: user?.full_name || "",
                  phone: user?.phone || "",
                  grade: user?.grade || ""
                });
              }}
              className="neumorphic-button px-6 py-3 text-gray-800 font-medium flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`neumorphic-button px-6 py-3 font-medium flex-1 flex items-center justify-center gap-2 ${
                saving ? "opacity-50 cursor-not-allowed" : "text-green-800"
              }`}
            >
              <Save className="w-5 h-5" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
